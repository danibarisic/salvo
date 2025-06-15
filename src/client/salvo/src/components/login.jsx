import React, { useState } from "react";

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const HandleLogin = async (e) => {
        e.preventDefault();

        const formBody = new URLSearchParams();
        formBody.append('email', email);
        formBody.append('password', password);

        try {
            const response = await fetch('http://localhost:8080/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: formBody.toString(),
                credentials: 'include',
            });

            if (response.ok) {
                console.log("Login Successful");
                setMessage("Login Successful");
            } else {
                console.log("Login Unsuccessful");
                setMessage("Login Failed");
            }
        } catch (error) {
            console.error("Error during login:", error);
            setMessage("Login Error");
        }
    };

    return (
        <form onSubmit={HandleLogin}>
            <label>
                Email:
                <input
                    type='text'
                    name='email'
                    placeholder='example@hotmail.com'
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
            </label>
            <label>
                Password:
                <input
                    type="password"
                    name="password"
                    placeholder="123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </label>
            <button type="submit">Login</button>
            <span>{message}</span>
        </form>
    )
}