import { render, screen, fireEvent } from "@testing-library/react";
import { MultiSelectGroup, SingleSelectGroup, OptionItem } from "./ListingFormComponents";
import { describe, it, expect, vi } from "vitest";

describe("MultiSelectGroup", () => {
    const options: OptionItem[] = [
        { label: "Option A", value: "A" },
        { label: "Option B", value: "B" },
        { label: "Option C", value: "C" },
        { label: "Option D", value: "D" },
        { label: "Option E", value: "E" },
    ];

    it("renders initial visible options up to limit", () => {
        render(
            <MultiSelectGroup
                options={options}
                selectedValues={[]}
                onChange={() => { }}
                limit={2}
            />
        );

        expect(screen.getByText("Option A")).toBeInTheDocument();
        expect(screen.getByText("Option B")).toBeInTheDocument();
        expect(screen.queryByText("Option C")).not.toBeInTheDocument();
    });

    it("prioritizes selected items in the visible list", () => {
        // Option D is initially hidden (index 3, limit 2)
        // If selected, it should move to visible list
        render(
            <MultiSelectGroup
                options={options}
                selectedValues={["D"]}
                onChange={() => { }}
                limit={2}
            />
        );

        expect(screen.getByText("Option D")).toBeInTheDocument();
        // Visible list should be D + (A or B depending on stable sort)
        // We expect A to be there because it's first in the original list
        expect(screen.getByText("Option A")).toBeInTheDocument();

        // Option B should now be hidden because D took a spot
        expect(screen.queryByText("Option B")).not.toBeInTheDocument();
    });

    it("prioritizes multiple selected items", () => {
        // Select D and E (starting at index 3 and 4)
        // Limit 2
        render(
            <MultiSelectGroup
                options={options}
                selectedValues={["D", "E"]}
                onChange={() => { }}
                limit={2}
            />
        );

        expect(screen.getByText("Option D")).toBeInTheDocument();
        expect(screen.getByText("Option E")).toBeInTheDocument();

        // A and B should be hidden
        expect(screen.queryByText("Option A")).not.toBeInTheDocument();
        expect(screen.queryByText("Option B")).not.toBeInTheDocument();
    });

    it("opens dialog on plus click", () => {
        render(
            <MultiSelectGroup
                options={options}
                selectedValues={[]}
                onChange={() => { }}
                limit={2}
            />
        );

        const plusBtn = screen.getByRole("button", { name: "" }); // Plus icon button might rely on icon finding or class
        // Easier: look for the button with the class or SVG.
        // The implementation has a button with <Plus />.

        // Actually, the button contains the Plus icon.
        // Let's find by class or just find the last button.
        const buttons = screen.getAllByRole("button");
        const lastButton = buttons[buttons.length - 1];

        fireEvent.click(lastButton);

        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
});

describe("SingleSelectGroup", () => {
    const options: OptionItem[] = [
        { label: "Option A", value: "A" },
        { label: "Option B", value: "B" },
        { label: "Option C", value: "C" },
    ];

    it("prioritizes selected item in visible list", () => {
        // C is at index 2. Limit 2. C should be hidden by default.
        // If C is selected, it should be visible.
        render(
            <SingleSelectGroup
                options={options}
                selectedValue="C"
                onChange={() => { }}
                limit={2}
            />
        );

        expect(screen.getByText("Option C")).toBeInTheDocument();
        // A should still be there
        expect(screen.getByText("Option A")).toBeInTheDocument();
        // B should be pushed out
        expect(screen.queryByText("Option B")).not.toBeInTheDocument();
    });
});
