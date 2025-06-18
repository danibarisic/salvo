import React, { useState, useEffect } from "react";

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check session status on initial load
    useEffect(() => {
        fetch("http://localhost:8080/api/players", {
            credentials: "include",
        })
            .then((res) => {
                setIsLoggedIn(res.ok);
            })
            .catch(() => setIsLoggedIn(false));
    }, []);

    const HandleLogin = async (e) => {
        e.preventDefault();
        setMessage("");

        //validation to ensure both fields are entered.
        if (!email.trim() || !password.trim()) {
            setMessage("Please enter both email and password.");
            return;
        }

        //Setting loading to true so user doesn't have to refresh if empty fields are submitted.
        setLoading(true);

        const formBody = new URLSearchParams();
        formBody.append('username', email);
        formBody.append('password', password);

        try {
            const response = await fetch('http://localhost:8080/login', {
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
            } else if (response.status === 401) {
                console.log("Login Failed: Unauthorized")
                setMessage("Login Failed: Unauthorized")
            } else {
                console.log("Login Unsuccessful");
                setMessage("Login Failed");
            }
        } catch (error) {
            console.error(error);
            setMessage("Login Error");
        } finally {
            setLoading(false);
        }
    };


    const HandleLogout = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const response = await fetch("http://localhost:8080/api/logout", {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                console.log("Logout Successful!");
                setMessage("Logout Successful!");
                window.location.href = "/login"
            }
        } catch (error) {
            console.error(error);
            setMessage("Error Logging Out");
        }
    }

    const HandleRegister = async (e) => {
        e.preventDefault();
        setMessage("");

        if (!email.trim() || !password.trim()) {
            setMessage("Please enter Email and Password");
            return;
        }

        setLoading(true);

        const formBody = new URLSearchParams();
        formBody.append("email", email);
        formBody.append("password", password);

        try {
            const response = await fetch("http://localhost:8080/api/players", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: formBody.toString(),
            });

            if (response.status === 201) {
                setMessage("Registration Successfull");
            } else {
                const errorData = await response.json();
                setMessage(errorData.error || "Registration Failed");
            }
        } catch (error) {
            console.error(error);
            setMessage("Error during registration");
        } finally {
            setLoading(false);
        }


    }
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

            <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>

            {isLoggedIn && (
                <button onClick={HandleLogout}>Log Out</button>
            )}

            <button onClick={HandleRegister} disabled={loading}>
                {loading ? "Registering..." : "Create Account"}
            </button>

            <span>{message}</span>
        </form>
    );
};