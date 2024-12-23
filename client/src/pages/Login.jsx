import { Button } from "@/components/ui/button";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useLoginUserMutation,
  useRegisterUserMutation,
} from "@/features/api/authApi.js";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Login = () => {
  const [signupInput, setSignupInput] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [loginInput, setLoginInput] = useState({ email: "", password: "" });
  const [
    registerUser,
    {
      data: registerData,
      error: registerError,
      isLoading: registerIsLoading,
      isSuccess: registerIsSuccess,
    },
  ] = useRegisterUserMutation();

  const [
    loginUser, 
    { 
      data : loginData,
      error: loginError,
      isLoading: loginIsLoading,
      isSuccess: loginIsSuccess
    }
  ] = useLoginUserMutation();

  const navigate = useNavigate();

  const changeHandler = (e, type) => {
    const { name, value } = e.target;
    if (type === "signup") {
      setSignupInput({ ...signupInput, [name]: value });
    } else {
      setLoginInput({ ...loginInput, [name]: value });
    }
  };

  const handleRegistration = async(type) => {
    const inputData = type === "signup" ? signupInput : loginInput;
    
    const action = type ==="signup"? registerUser : loginUser;
    await action(inputData);
  };

  //displaying the message -> Error aa rha h iss part me-> Correct it out man!
  useEffect(()=>{
    //display toast message
     if(registerIsSuccess && registerData){
       toast.success(registerData.message || "Signup Successful.")
     }

     if(registerError){
      
      toast.error(registerError.data.message || "Signup failed")
     }

     if(loginIsSuccess && loginData){ 
        toast.success(loginData.message || "Login Successful.")
        navigate("/");
     }

     if(loginError){
      toast.error(loginError.data.message || "Login failed")
     }

  },[loginIsSuccess, registerIsSuccess, loginData, registerData, loginError, registerError])

  return (
    <div className="flex items-center w-full justify-center mt-20 ">
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signup">Signup</TabsTrigger>
          <TabsTrigger value="login">Login</TabsTrigger>
        </TabsList>
        <TabsContent value="signup">
          <Card>
            <CardHeader>
              <CardTitle>Signup</CardTitle>
              <CardDescription>
                Create a new account and click signup when you're done.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  type="text"
                  name="name"
                  value={signupInput.name}
                  onChange={(e) => changeHandler(e, "signup")}
                  id="name"
                  placeholder="John "
                  required="true"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="emailId">Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={signupInput.email}
                  onChange={(e) => changeHandler(e, "signup")}
                  id="emailId"
                  placeholder="John@gmail.com"
                  required="true"
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  value={signupInput.password}
                  onChange={(e) => changeHandler(e, "signup")}
                  id="password"
                  placeholder="xyz"
                  required="true"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                disabled={registerIsLoading}
                onClick={() => handleRegistration("signup")}>
                {
                  registerIsLoading ?  (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                    </>
                  ) : "Signup"
                }
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Login</CardTitle>
              <CardDescription>
                Enter your credentials correctly to login.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-1">
                <Label htmlFor="emailId">Email</Label>
                <Input
                  type="email"
                  name="email"
                  value={loginInput.email}
                  onChange={(e) => changeHandler(e, "login")}
                  id="emailId"
                  placeholder="John@gmail.com"
                  required="true"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  value={loginInput.password}
                  onChange={(e) => changeHandler(e, "login")}
                  type="password"
                  placeholder="xyz"
                  required="true"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button disabled= {loginIsLoading} onClick={() => handleRegistration("login")}>
                {
                  loginIsLoading ? (
                    <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait
                    </>
                  ) : "Login"
                }
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Login;
