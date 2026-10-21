import { expect, test } from "bun:test";
import { renderToStaticMarkup } from "react-dom/server";
import { ClinicServiceList } from "./catalog";

function render(active: boolean, manage = true, labels = true) {
  return renderToStaticMarkup(
    <ClinicServiceList
      facilities={[
        {
          id: "service-a",
          name: "Urine test",
          shortDescription: "",
          description: "",
          category: "Laboratory",
          startingPrice: 300,
          priceText: "",
          currency: "INR",
          onlineBooking: false,
          appointmentRequired: true,
          status: active ? "active" : "archived",
          isAvailable: active,
        },
      ]}
      permissions={{
        read: true,
        create: manage,
        update: manage,
        publish: manage,
        archive: manage,
        delete: manage,
      }}
      actionLabels={
        labels
          ? {
              edit: "Edit",
              activate: "Publish",
              deactivate: "Unpublish",
              delete: "Delete",
            }
          : undefined
      }
      onEdit={() => {}}
      onActivate={() => {}}
      onDeactivate={() => {}}
      onDelete={() => {}}
    />
  );
}
test("diagnostic rows expose clear edit, publish/unpublish and delete actions to managers", () => {
  expect(render(false)).toContain("Publish");
  expect(render(true)).toContain("Unpublish");
  expect(render(true)).toContain("Edit Urine test");
  expect(render(true)).toContain("Delete Urine test");
  expect(render(true)).not.toContain("Deactivate");
});
test("read-only staff do not see mutation actions; other catalogues retain activate/deactivate labels", () => {
  expect(render(true, false)).not.toContain("Delete Urine test");
  expect(render(true, false)).not.toContain("Edit Urine test");
  expect(render(true, false)).not.toContain("Unpublish");
  expect(render(true, true, false)).toContain("Deactivate");
  expect(render(false, true, false)).toContain("Activate");
});
