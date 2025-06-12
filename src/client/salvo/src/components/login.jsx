import React, { useState } from "react";

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const HandleLogin = async (e) => {
        e.preventDefault();
        const response = await fetch('api/players', {
            method: 'POST',
            headers: new Headers({
                'Content-Type': 'application/x-www-form-urlencoded',
            }),
            body: 'username=j.bauer@ctu.gov&password=123',
        });

        if (response.ok) {
            console.log("Login Successful");
        } else {
            console.log("Login Unsuccessful");
        }
    };

    return (
        <form onSubmit={HandleLogin}>
            <label>
                UserName:
                <input
                    type='text'
                    name='username'
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