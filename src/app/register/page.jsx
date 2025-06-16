'use client'

import { Button } from "@mui/material";
import { useState } from "react";
import Login from "@/components/login"
import Register from "@/components/register";

const LogReg = () => {
    const [isLogin, setLogin] = useState(true)


    return (
        <div className="login">
            <div className="chose">
                <Button onClick={()=>setLogin(true)} variant="contained">Login</Button>
                <Button onClick={()=>setLogin(false)} variant="contained">Register</Button>
            </div>
            {isLogin 
                ?<div>
                    <Login/>
                </div>
                :<div>
                    <Register/>
                </div>
            }
        </div>
    );
  };
  
  export default LogReg;