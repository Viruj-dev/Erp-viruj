import { expect, test } from "bun:test";
import { runBulkRequests } from "./bulk-feedback";
import { notificationEvents } from "./notification-events";
import type { ToastInput } from "./notification-types";

async function capture(requests: Array<() => Promise<number>>) {
  const feedback: ToastInput[] = [];
  const stop = notificationEvents.on("toast.show", (toast) =>
    feedback.push(toast)
  );
  try {
    return {
      result: await runBulkRequests(requests, "services published"),
      feedback,
    };
  } finally {
    stop();
  }
}

test("25 successful bulk requests produce one counted popup", async () => {
  const { result, feedback } = await capture(
    Array.from({ length: 25 }, (_, id) => async () => id)
  );
  expect(result.completed).toHaveLength(25);
  expect(result.failed).toBe(0);
  expect(feedback).toEqual([
    { title: "25 services published", description: undefined, tone: "success" },
  ]);
});

test("partial failures keep accurate counts and successful results", async () => {
  const { result, feedback } = await capture([
    async () => 1,
    async () => {
      throw Error("Failed");
    },
    async () => 3,
  ]);
  expect(result).toEqual({ completed: [1, 3], failed: 1 });
  expect(feedback).toHaveLength(1);
  expect(feedback[0]).toMatchObject({
    title: "2 of 3 services published",
    tone: "warning",
  });
  expect(feedback[0]?.description).toContain("1 failed");
});

test("all failures including synchronous exceptions produce one error summary", async () => {
  const { result, feedback } = await capture([
    () => {
      throw Error("Failed");
    },
    async () => {
      throw Error("Failed");
    },
  ]);
  expect(result).toEqual({ completed: [], failed: 2 });
  expect(feedback).toHaveLength(1);
  expect(feedback[0]).toMatchObject({
    title: "0 of 2 services published",
    tone: "error",
  });
});

test("empty bulk operations produce no popup", async () => {
  expect(await capture([])).toEqual({
    result: { completed: [], failed: 0 },
    feedback: [],
  });
});

test("summary waits for remaining requests after an early failure", async () => {
  const feedback: ToastInput[] = [];
  const stop = notificationEvents.on("toast.show", (toast) =>
    feedback.push(toast)
  );
  let finish!: (value: number) => void;
  const remaining = new Promise<number>((resolve) => {
    finish = resolve;
  });
  try {
    const bulk = runBulkRequests(
      [
        async () => {
          throw Error("Failed");
        },
        () => remaining,
      ],
      "services published"
    );
    await Promise.resolve();
    expect(feedback).toHaveLength(0);
    finish(1);
    expect(await bulk).toEqual({ completed: [1], failed: 1 });
    expect(feedback).toHaveLength(1);
  } finally {
    stop();
  }
});
