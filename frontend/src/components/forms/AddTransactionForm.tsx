import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Resolver } from "react-hook-form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createTransaction } from "../../services/transaction.service";
import { getCategories } from "../../services/category.service";
import {
  inputClass,
  buttonClass,
  labelClass,
  errorClass,
} from "../../utils/styles";

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
      queryClient.invalidateQueries({
        queryKey: ["transactions"],
        exact: false,
      });
      queryClient.invalidateQueries({ queryKey: ["stats"], exact: false });
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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <label className={labelClass}>Description</label>
          <input
            placeholder="e.g. McDonald's, Uber, Netflix"
            {...register("description")}
            className={inputClass}
          />
          {errors.description && (
            <p className={errorClass}>{errors.description.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Amount</label>
          <input
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount")}
            className={inputClass}
          />
          {errors.amount && (
            <p className={errorClass}>{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label className={labelClass}>Date</label>
          <input type="date" {...register("date")} className={inputClass} />
          {errors.date && <p className={errorClass}>{errors.date.message}</p>}
        </div>

        <div className="col-span-2">
          <label className={labelClass}>Category</label>
          <select
            {...register("categoryId")}
            className={`${inputClass} bg-white`}
          >
            <option value="">✨ Let AI suggest a category</option>
            {categories?.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {mutation.isError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <p className="text-red-600 text-sm">Failed to add transaction</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting || mutation.isPending}
        className={buttonClass}
      >
        {mutation.isPending ? "Adding..." : "Add Transaction"}
      </button>
    </form>
  );
};
