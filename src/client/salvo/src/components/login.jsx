import React, { useState } from "react";

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    return (
        <login type="text">Enter Name</login>
    )
}