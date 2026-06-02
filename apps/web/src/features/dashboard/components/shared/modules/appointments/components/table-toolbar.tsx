import { Filter, Search } from "lucide-react";

export function TableToolbar({
  departmentFilter,
  departments,
  onDepartmentFilter,
  onQuery,
  query,
  title,
}: {
  departmentFilter: string;
  departments: string[];
  onDepartmentFilter: (value: string) => void;
  onQuery: (value: string) => void;
  query: string;
  title: string;
}) {
  return (
    <div className="grid gap-3 p-5 lg:grid-cols-[1fr_220px_220px]">
      <div>
        <h2 className="font-headline text-xl font-semi-bold text-on-surface">
          {title}
        </h2>
        <p className="text-sm font-medium text-on-surface-variant">
          List-first workflow for appointment handler decisions.
        </p>
      </div>
      <label className="relative block">
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          size={15}
        />
        <input
          className="h-11 w-full rounded-xl border border-outline-variant/20 bg-surface-container-low py-2 pl-9 pr-3 text-sm font-semibold text-on-surface outline-none focus:border-primary"
          onChange={(event) => onQuery(event.target.value)}
          placeholder="Search appointments..."
          value={query}
        />
      </label>
      <label className="relative block">
        <Filter
          className="absolute left-3 top-1/2 -translate-y-1/2 text-outline"
          size={15}
        />
        <select
          className="h-11 w-full appearance-none rounded-xl border border-outline-variant/20 bg-surface-container-low py-2 pl-9 pr-3 text-sm font-semi-bold text-on-surface outline-none focus:border-primary"
          onChange={(event) => onDepartmentFilter(event.target.value)}
          value={departmentFilter}
        >
          <option value="all">All departments</option>
          {departments.map((department) => (
            <option key={department} value={department}>
              {department}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
