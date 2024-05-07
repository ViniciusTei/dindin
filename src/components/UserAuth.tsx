import { useAuth } from "@/context/auth";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useForm } from "react-hook-form";
import { Form } from "./ui/form";
import EmailInput from "./form/EmailInput";
import PasswordInput from "./form/PasswordInput";

function UserAuth() {
  const { user, signIn, signUp, signOut } = useAuth();

  if (!user) {
    return (
      <Dialog open={!user}>
        <DialogTrigger>...</DialogTrigger>
        <DialogContent showClose={false}>
          <DialogHeader>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">SignIn</TabsTrigger>
                <TabsTrigger value="signup">SignUp</TabsTrigger>
              </TabsList>
              <TabsContent value="signin">
                <DialogTitle>Faça login para usar a ferramenta</DialogTitle>
                <DialogDescription>
                  Você precisa fazer o login para poder ter seus dados salvos e
                  disponiveis a qualquer momento.
                </DialogDescription>
                <LoginForm handleSubmit={signIn} />
              </TabsContent>
              <TabsContent value="signup">
                <DialogTitle>Faça seu registro</DialogTitle>
                <DialogDescription>
                  Você precisa fazer o login para poder ter seus dados salvos e
                  disponiveis a qualquer momento.
                </DialogDescription>
                <RegisterForm handleSubmit={signUp} />
              </TabsContent>
            </Tabs>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user.photoURL ? user.photoURL : undefined} />
          <AvatarFallback>{user.email?.slice(0, 2)}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>Settings</DropdownMenuItem>
        <DropdownMenuItem onClick={signOut}>SignOut</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

interface LoginFormProps {
  handleSubmit: (email: string, password: string) => void;
}

type LoginForm = {
  email: string;
  password: string;
};

function LoginForm({ handleSubmit }: LoginFormProps) {
  const form = useForm<LoginForm>();

  function onSubmit(values: LoginForm) {
    if (values.email && values.password) {
      handleSubmit(values.email, values.password);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 mx-16">
        <EmailInput form={form} />
        <PasswordInput form={form} />
        <Button type="submit" className="w-full">
          Login
        </Button>
      </form>
    </Form>
  );
}

interface RegisterFormProps {
  handleSubmit: (email: string, password: string) => void;
}

type RegisterForm = {
  email: string;
  password: string;
  confirm_password: string;
};

function RegisterForm({ handleSubmit }: RegisterFormProps) {
  const form = useForm<RegisterForm>();

  function onSubmit(values: RegisterForm) {
    if (values.email && values.password && values.confirm_password) {
      handleSubmit(values.email, values.password);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 mx-16">
        <EmailInput form={form} />
        <PasswordInput form={form} />
        <PasswordInput form={form} name="confirm_password" showDescription />
        <Button type="submit" className="w-full">
          Register
        </Button>
      </form>
    </Form>
  );
}

export default UserAuth;
