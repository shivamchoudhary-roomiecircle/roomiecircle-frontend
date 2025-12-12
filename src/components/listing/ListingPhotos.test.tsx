import { render, screen, fireEvent } from "@testing-library/react";
import { ListingPhotos } from "./ListingPhotos";
import { describe, it, expect } from "vitest";

describe("ListingPhotos", () => {
    it("renders the main image with correct attributes", () => {
        const images = ["image1.jpg", "image2.jpg"];
        render(<ListingPhotos images={images} description="Test Home" />);

        const mainImage = screen.getByAltText("Test Home");
        expect(mainImage).toBeInTheDocument();
        expect(mainImage).toHaveAttribute("src", expect.stringContaining("image1.jpg"));
        // Verify our fix: check for the attribute presence
        expect(mainImage).toHaveAttribute("fetchpriority", "high");
    });

    it("handles empty images gracefully", () => {
        const { container } = render(<ListingPhotos images={[]} />);
        // Should render the placeholder (Home icon)
        // Lucide icons usually render as SVGs
        const simpleIcon = container.querySelector("svg");
        expect(simpleIcon).toBeInTheDocument();
        expect(simpleIcon).toHaveClass("lucide-house");
    });

    it("opens lightbox on click", () => {
        const images = ["image1.jpg", "image2.jpg"];
        render(<ListingPhotos images={images} />);

        const mainImage = screen.getByAltText("Listing main image");
        fireEvent.click(mainImage);

        // Lightbox should be open (Dialog content)
        expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
});
