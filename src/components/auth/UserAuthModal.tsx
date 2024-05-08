import { useMediaQuery } from "@/lib/hooks";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";

interface UserAuthModalProps {
  open: boolean;
}

export default function UserAuthModal({ open }: UserAuthModalProps) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open}>
        <DialogTrigger>...</DialogTrigger>
        <DialogContent showClose={false}>
          <DialogHeader>
            <DialogTitle>Bem vindo!</DialogTitle>
            <DialogDescription>
              Você precisa fazer o login ou cadastro para poder ter seus dados
              salvos e disponiveis a qualquer momento.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Registar</TabsTrigger>
            </TabsList>
            <TabsContent value="signin">
              <DialogDescription>
                Você precisa fazer o login para poder ter seus dados salvos e
                disponiveis a qualquer momento.
              </DialogDescription>
              <LoginForm />
            </TabsContent>
            <TabsContent value="signup">
              <DialogDescription>
                Você precisa fazer o seu cadastro para começar a ter seus dados
                salvos e disponiveis a qualquer momento.
              </DialogDescription>
              <RegisterForm />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open}>
      <DrawerTrigger>...</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader className="text-left">
          <DrawerTitle>Bem vindo!</DrawerTitle>
          <DrawerDescription>
            Você precisa fazer o login ou cadastro para poder ter seus dados
            salvos e disponiveis a qualquer momento.
          </DrawerDescription>
        </DrawerHeader>
        <Tabs defaultValue="signin" className="w-full p-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Entrar</TabsTrigger>
            <TabsTrigger value="signup">Registar</TabsTrigger>
          </TabsList>
          <TabsContent value="signin">
            <DialogDescription>
              Você precisa fazer o login para poder ter seus dados salvos e
              disponiveis a qualquer momento.
            </DialogDescription>
            <LoginForm />
          </TabsContent>
          <TabsContent value="signup">
            <DialogDescription>
              Você precisa fazer o seu cadastro para começar a ter seus dados
              salvos e disponiveis a qualquer momento.
            </DialogDescription>
            <RegisterForm />
          </TabsContent>
        </Tabs>
      </DrawerContent>
    </Drawer>
  );
}
