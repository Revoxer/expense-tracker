import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createTransaction } from "../../services/transaction.service";
import { getCategories } from "../../services/category.service";

const transactionSchema = z.object({
  description: z.string().min(1, "Description is required"),
  amount: z.coerce.number().positive("Amount must be positive"),
  date: z.string().min(1, "Date is required"),
  categoryId: z.string().optional(),
});

type TransactionForm = z.infer<typeof transactionSchema>;

export const AddTransactionForm = () => {
  const queryClient = useQueryClient();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const mutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      reset();
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema) as Resolver<TransactionForm>,
  });

  const onSubmit = async (data: TransactionForm) => {
    await mutation.mutateAsync(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <input placeholder="Description" {...register("description")} />
        {errors.description && <p>{errors.description.message}</p>}
      </div>
      <div>
        <input type="number" placeholder="Amount" {...register("amount")} />
        {errors.amount && <p>{errors.amount.message}</p>}
      </div>
      <div>
        <input type="date" {...register("date")} />
        {errors.date && <p>{errors.date.message}</p>}
      </div>
      <div>
        <select {...register("categoryId")}>
          <option value="">AI will suggest category</option>
          {categories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.icon} {cat.name}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={isSubmitting || mutation.isPending}>
        {mutation.isPending ? "Adding..." : "Add Transaction"}
      </button>
      {mutation.isError && <p>Failed to add transaction</p>}
    </form>
  );
};
