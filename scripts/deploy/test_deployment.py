"""Regression tests for promotion, rollback and release packaging; no real services."""

import os, subprocess, tempfile, tarfile, pathlib, unittest
ROOT = pathlib.Path(__file__).resolve().parents[2]
MOCK = "#!/usr/bin/env python3\nimport os,sys,pathlib,subprocess\nname=pathlib.Path(sys.argv[0]).name\nargs=sys.argv[1:]\nhome=pathlib.Path(os.environ['MOCK_HOME'])\nbase=home/'.local/share/viruj-deploy'/os.environ['MOCK_SERVICE']\nwith (home/'calls').open('a') as f: f.write(name+' '+' '.join(args)+'\\n')\nif name=='id': print('ubuntu')\nelif name=='bun':\n if args==['--version']: print('1.4.2')\n elif (home/'fail_build').exists(): sys.exit(1)\nelif name=='sudo':\n args=args[1:] if args[0]=='-n' else args\n sys.exit(subprocess.run(args).returncode)\nelif name=='systemctl':\n if args[0]=='show': print('ubuntu')\n if args[0]=='restart' and (home/'fail_restart').exists():\n  (home/'fail_restart').unlink(); sys.exit(1)\nelif name=='curl':\n current=base/'current'\n if (home/'fail_health').exists() and current.is_symlink() and 'badbad' in str(current.resolve()): sys.exit(1)\nelif name=='sleep': pass\n"

class DeploymentTests(unittest.TestCase):

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory(prefix='viruj-deploy-test-')
        self.home = pathlib.Path(self.tmp.name)
        self.bin = self.home / 'bin'
        self.bin.mkdir()
        for name in ['id', 'bun', 'sudo', 'systemctl', 'curl', 'sleep']:
            p = self.bin / name
            p.write_text(MOCK)
            p.chmod(493)

    def tearDown(self):
        self.tmp.cleanup()

    def prepare(self, repo):
        self.repo = repo
        profile = 'SERVICE=viruj-auth\nORIGINAL_ROOT=/home/ubuntu/Erp-viruj\nSERVICE_SUBDIR=apps/server\nENTRYPOINT=src/dev.ts\nHEALTH_URL=http://127.0.0.1:3002/\nBUN_VERSION=1.4.2\n' if repo == 'Erp-viruj' else 'SERVICE=viruj-backend\nORIGINAL_ROOT=/home/ubuntu/Viruj-Backend\nSERVICE_SUBDIR=.\nENTRYPOINT=apps/api/src/main.ts\nHEALTH_URL=http://127.0.0.1:4000/ready\nBUN_VERSION=1.4.2\n'
        self.service = 'viruj-auth' if repo == 'Erp-viruj' else 'viruj-backend'
        self.base = self.home / '.local/share/viruj-deploy' / self.service
        self.original = self.home / repo
        self.original.mkdir()
        subprocess.run(['git', 'init', '-q', str(self.original)], check=True)
        (self.original / 'storage').mkdir()
        (self.original / 'apps/server').mkdir(parents=True)
        (self.original / '.env').write_text('SECRET=keep-me\n')
        (self.original / 'apps/server/.env').write_text('SECRET=keep-me\n')
        self.profile = profile.replace('/home/ubuntu', str(self.home))
        self.env = dict(os.environ, PATH=str(self.bin) + ':' + os.environ['PATH'], MOCK_HOME=str(self.home), MOCK_SERVICE=self.service)

    def deploy(self, sequence, sha='a' * 40):
        incoming = self.home / f'incoming-{sequence}'
        incoming.mkdir()
        (incoming / 'profile.sh').write_text(self.profile)
        text = (ROOT / 'scripts/deploy/deploy-ec2.sh').read_text().replace('/home/ubuntu', str(self.home)).replace('/etc/systemd/system', str(self.home / 'systemd'))
        (incoming / 'deploy-ec2.sh').write_text(text)
        payload = self.home / 'payload'
        payload.mkdir(exist_ok=True)
        (payload / 'apps/server').mkdir(parents=True, exist_ok=True)
        (payload / 'package.json').write_text('{}')
        with tarfile.open(incoming / 'release.tar.gz', 'w:gz') as t:
            for p in payload.rglob('*'):
                t.add(p, arcname=str(p.relative_to(payload)), recursive=False)
        return subprocess.run(['bash', str(incoming / 'deploy-ec2.sh'), sha, str(sequence), '1'], env=self.env, capture_output=True, text=True)

    def test_success_and_stale_run(self):
        self.prepare('Erp-viruj')
        first = self.deploy(3)
        self.assertEqual(first.returncode, 0, first.stderr)
        current = (self.base / 'current').resolve()
        self.assertTrue((current / 'apps/server/.env').is_symlink())
        self.assertEqual((self.original / 'apps/server/.env').read_text(), 'SECRET=keep-me\n')
        old = self.deploy(2)
        self.assertEqual(old.returncode, 0, old.stderr)
        self.assertEqual((self.base / 'current').resolve(), current)

    def test_health_failure_restores_original_on_first_deploy(self):
        self.prepare('Viruj-Backend')
        (self.home / 'fail_health').touch()
        result = self.deploy(1, 'badbad' + 'a' * 34)
        self.assertNotEqual(result.returncode, 0)
        self.assertIn('Previous release restored', result.stderr)
        self.assertFalse((self.base / 'current').exists())
        self.assertFalse((self.home / 'systemd/viruj-backend.service.d/99-github-deploy.conf').exists())

    def test_health_failure_restores_previous_release_and_config(self):
        self.prepare('Viruj-Backend')
        result = self.deploy(1)
        self.assertEqual(result.returncode, 0, result.stderr)
        current = (self.base / 'current').resolve()
        config = self.home / 'systemd/viruj-backend.service.d/99-github-deploy.conf'
        original_config = config.read_text()
        (self.home / 'fail_health').touch()
        result = self.deploy(2, 'badbad' + 'a' * 34)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual((self.base / 'current').resolve(), current)
        self.assertEqual(config.read_text(), original_config)
        self.assertEqual((self.base / 'last-success').read_text(), '1 1\n')

    def test_install_failure_never_restarts_running_service(self):
        self.prepare('Erp-viruj')
        (self.home / 'fail_build').touch()
        result = self.deploy(1)
        self.assertNotEqual(result.returncode, 0)
        self.assertNotIn('systemctl restart', (self.home / 'calls').read_text())

    def test_restart_failure_rolls_back(self):
        self.prepare('Erp-viruj')
        result = self.deploy(1)
        self.assertEqual(result.returncode, 0, result.stderr)
        current = (self.base / 'current').resolve()
        (self.home / 'fail_restart').touch()
        result = self.deploy(2, 'b' * 40)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual((self.base / 'current').resolve(), current)

    def test_release_archive_excludes_secrets_and_uploads(self):
        fixture = self.home / 'archive-source'
        fixture.mkdir()
        for name in ['.env', '.env.remote-backup', 'apps/server/.env', 'storage/private-upload.txt', 'private.pem', 'scripts/.erp-test-secrets/token', 'package.json']:
            file = fixture / name
            file.parent.mkdir(parents=True, exist_ok=True)
            file.write_text('fixture')
        subprocess.run(['git', 'init', '-q', str(fixture)], check=True)
        subprocess.run(['git', 'add', '.'], cwd=fixture, check=True)
        subprocess.run(['git', '-c', 'user.name=Pipeline Test', '-c', 'user.email=test@example.invalid', 'commit', '-qm', 'fixture'], cwd=fixture, check=True)
        archive = self.home / 'release.tar.gz'
        subprocess.run(['python3', str(ROOT / 'scripts/deploy/package-release.py'), str(archive)], cwd=fixture, check=True)
        with tarfile.open(archive) as source:
            self.assertEqual(source.getnames(), ['package.json'])
if __name__ == '__main__':
    unittest.main(verbosity=2)
