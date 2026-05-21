import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createIssueSchema, type CreateIssueInput } from "../lib/schema";

export function CreateIssueForm({ onCreate }: { onCreate: (input: CreateIssueInput) => void }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateIssueInput>({
    resolver: zodResolver(createIssueSchema),
    defaultValues: { title: "", assignee: "", priority: "medium", status: "open" },
  });

  return (
    <form
      onSubmit={handleSubmit((data) => {
        onCreate(data);
        reset();
      })}
      aria-label="Create issue"
      style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "flex-start" }}
    >
      <div>
        <input aria-label="Title" placeholder="Title" {...register("title")} />
        {errors.title && <p role="alert" style={{ color: "crimson", margin: 0 }}>{errors.title.message}</p>}
      </div>
      <div>
        <input aria-label="Assignee" placeholder="Assignee" {...register("assignee")} />
        {errors.assignee && <p role="alert" style={{ color: "crimson", margin: 0 }}>{errors.assignee.message}</p>}
      </div>
      <select aria-label="Priority" {...register("priority")}>
        <option value="low">low</option>
        <option value="medium">medium</option>
        <option value="high">high</option>
        <option value="critical">critical</option>
      </select>
      <select aria-label="Status" {...register("status")}>
        <option value="open">open</option>
        <option value="in_progress">in_progress</option>
        <option value="closed">closed</option>
      </select>
      <button type="submit" disabled={isSubmitting}>Add issue</button>
    </form>
  );
}
