import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import Icon from "./ui/icon";
import { useState } from "react";
import { NewTransactionForm } from "./transactions";

export default function NewTransactions() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open}>
      <DialogTrigger asChild>
        <Button onClick={() => setOpen(true)}>
          <Icon name="plus" className="mr-2" /> Nova entrada
        </Button>
      </DialogTrigger>
      <DialogContent handleClose={() => setOpen(false)}>
        <DialogHeader>
          <DialogTitle>Cadastro</DialogTitle>
          <DialogDescription>
            Adicione uma nova receita ou despesa.
          </DialogDescription>
        </DialogHeader>

        <NewTransactionForm onFinish={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
