import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { Label } from "../ui/label";

export default function CategoriesForm() {
  return (
    <Card id="Categorias" className="mb-4 w-10/12 md:w-full md:max-w-screen-md">
      <CardHeader>
        <CardTitle>Categorias</CardTitle>
        <CardDescription>Gerencie suas categorias</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="categories">Current Categories</Label>
            <Textarea
              className="min-h-[100px]"
              defaultValue="Rent, Groceries, Utilities, Transportation, Entertainment"
              id="categories"
              placeholder="Rent, Groceries, Utilities, Transportation, Entertainment"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="newCategory">Add New Category</Label>
            <div className="flex items-center gap-2">
              <Input id="newCategory" placeholder="Enter new category" />
              <Button>Add</Button>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t p-6">
        <Button>Salvar</Button>
      </CardFooter>
    </Card>
  );
}
