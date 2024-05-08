import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createLazyFileRoute("/settings")({
  component: Settings,
});

function Settings() {
  const [active, setActive] = useState("Conta");
  return (
    <div className="h-screen w-full flex flex-col">
      <PageHeader title="Settings" />
      <main className="flex p-8">
        <div className="min-w-72">
          <nav className="grid gap-4 text-gray-500 font-semibold text-sm">
            {SettingsMenuItems.map((item) => (
              <span
                key={item}
                className={active === item ? "text-gray-900" : ""}
              >
                <a href={`#${item}`} onClick={() => setActive(item)}>
                  {item}
                </a>
              </span>
            ))}
          </nav>
        </div>

        <div className="flex-grow">
          <Card id="Conta" className="mb-4 max-w-screen-md">
            <CardHeader>
              <CardTitle>Conta</CardTitle>
              <CardDescription>
                Troque sua senha para melhorar a seguranca
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input id="currentPassword" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input id="newPassword" type="password" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input id="confirmPassword" type="password" />
                </div>
              </form>
            </CardContent>
            <CardFooter className="border-t p-6">
              <Button>Salvar</Button>
            </CardFooter>
          </Card>

          <Card id="Budget" className="mb-4 max-w-screen-md">
            <CardHeader>
              <CardTitle>Orçamento</CardTitle>
              <CardDescription>Defina seu orçamento mensal</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="grid gap-4">
                <div className="flex items-center gap-4">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className="flex-1 flex-col h-auto items-start"
                        variant="outline"
                      >
                        <span className="font-semibold uppercase text-[0.65rem]">
                          Start Date
                        </span>
                        <span className="font-normal">April 1, 2023</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 max-w-[276px]">
                      <Calendar />
                    </PopoverContent>
                  </Popover>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        className="flex-1 flex-col h-auto items-start"
                        variant="outline"
                      >
                        <span className="font-semibold uppercase text-[0.65rem]">
                          End Date
                        </span>
                        <span className="font-normal">April 30, 2023</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="p-0 max-w-[276px]">
                      <Calendar />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="budgetAmount">Monthly Budget</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      defaultValue="2000"
                      id="budgetAmount"
                      placeholder="$2,000"
                      type="number"
                    />
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="border-t p-6">
              <Button>Salvar</Button>
            </CardFooter>
          </Card>

          <Card id="Categorias" className="mb-4 max-w-screen-md">
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
        </div>
      </main>
    </div>
  );
}

const SettingsMenuItems = ["Conta", "Budget", "Categorias"];
