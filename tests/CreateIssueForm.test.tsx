import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CreateIssueForm } from "../src/components/CreateIssueForm";

describe("CreateIssueForm", () => {
  it("shows a validation error when the title is too short", async () => {
    const onCreate = vi.fn();
    render(<CreateIssueForm onCreate={onCreate} />);
    await userEvent.type(screen.getByLabelText("Title"), "ab");
    await userEvent.type(screen.getByLabelText("Assignee"), "alice");
    await userEvent.click(screen.getByRole("button", { name: /add issue/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/at least 3/i);
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("requires an assignee", async () => {
    const onCreate = vi.fn();
    render(<CreateIssueForm onCreate={onCreate} />);
    await userEvent.type(screen.getByLabelText("Title"), "Valid title");
    await userEvent.click(screen.getByRole("button", { name: /add issue/i }));
    expect(await screen.findByText(/assignee is required/i)).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it("submits valid input and resets", async () => {
    const onCreate = vi.fn();
    render(<CreateIssueForm onCreate={onCreate} />);
    await userEvent.type(screen.getByLabelText("Title"), "Fix the thing");
    await userEvent.type(screen.getByLabelText("Assignee"), "bob");
    await userEvent.click(screen.getByRole("button", { name: /add issue/i }));
    expect(onCreate).toHaveBeenCalledTimes(1);
    expect(onCreate).toHaveBeenCalledWith({
      title: "Fix the thing",
      assignee: "bob",
      priority: "medium",
      status: "open",
    });
  });
});
