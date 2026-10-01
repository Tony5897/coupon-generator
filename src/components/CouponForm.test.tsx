import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import CouponForm from "./CouponForm";

vi.mock("@/components/ThemeToggle", () => ({ ThemeToggle: () => null }));
vi.mock("qrcode.react", () => ({ QRCodeCanvas: ({ value }: { value: string }) => <span aria-label="QR payload">{value}</span> }));

beforeEach(() => localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); vi.unstubAllGlobals(); });
const generate = () => fireEvent.click(screen.getByRole("button", { name: "Generate Coupon" }));

describe("CouponForm failure boundaries", () => {
  it("keeps the displayed expiration attached to the generated code after deletion", () => {
    render(<CouponForm />);
    fireEvent.change(screen.getByLabelText(/Expiration Date/), { target: { value: "2099-01-01" } });
    generate();
    fireEvent.change(screen.getByLabelText(/Expiration Date/), { target: { value: "2099-02-01" } });
    generate();
    fireEvent.click(screen.getAllByRole("button", { name: "Delete coupon" })[0]);
    expect(screen.getByText("2099-02-01", { exact: false })).toBeInTheDocument();
  });
  it("continues generating when storage reads are denied", () => {
    vi.stubGlobal("localStorage", { getItem: () => { throw new Error("Denied"); } });
    render(<CouponForm />);
    generate();
    expect(screen.getByRole("status")).toHaveTextContent("session only");
    expect(screen.getByLabelText("QR payload")).toHaveTextContent(/^SAVE10-/);
  });
  it("preserves malformed stored data and starts a session-only list", () => {
    localStorage.setItem("coupons", '{"unexpected":true}');
    render(<CouponForm />);
    generate();
    expect(localStorage.getItem("coupons")).toBe('{"unexpected":true}');
    expect(screen.getByRole("status")).toHaveTextContent("could not be loaded");
  });
  it("reports quota failures without losing the generated coupon", () => {
    vi.stubGlobal("localStorage", { getItem: () => null, removeItem: () => {}, setItem: () => { throw new Error("Quota"); } });
    render(<CouponForm />);
    generate();
    expect(screen.getByRole("status")).toHaveTextContent("could not be saved");
    expect(screen.getByLabelText("QR payload")).toHaveTextContent(/^SAVE10-/);
  });
  it("offers manual copy when the clipboard API is unavailable", async () => {
    vi.stubGlobal("navigator", { clipboard: undefined });
    render(<CouponForm />);
    generate();
    fireEvent.click(screen.getByRole("button", { name: "Copy Code" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("copy the code manually");
  });
  it("offers manual copy when permission is denied", async () => {
    vi.stubGlobal("navigator", { clipboard: { writeText: vi.fn().mockRejectedValue(new Error("Denied")) } });
    render(<CouponForm />);
    generate();
    fireEvent.click(screen.getByRole("button", { name: "Copy Code" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("copy the code manually");
  });
  it("rejects a past expiration before creating a coupon", () => {
    render(<CouponForm />);
    fireEvent.change(screen.getByLabelText(/Expiration Date/), { target: { value: "2000-01-01" } });
    generate();
    expect(screen.getByRole("alert")).toHaveTextContent("today or a later");
    expect(screen.queryByLabelText("QR payload")).toBeNull();
  });
});
