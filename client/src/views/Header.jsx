import { useState, useRef } from "react";
import { api } from "../services/api.js";
import Cookies from "js-cookie";

export function Header() {
    const [isFormOpen, setFormOpen] = useState();
    const [actionForm, setActionForm] = useState("Login");
    const [passView, setPassView] = useState(false);
    const formRef = useRef();
    const inputEmail = useRef();
    const inputPass = useRef();
    const inputPassConfirm = useRef();
    const inputName = useRef();
    const inputCPF = useRef();
    const inputTel = useRef();

    async function doLogin() {
        if(inputEmail.current.value && inputPass.current.value) {
            try {
                const token = await api.post("/auth/login", {
                    email: inputEmail.current.value,
                    pass: inputPass.current.value,
                });
                const cookieDuration = 60/1440; // Expiration time in minutes
                Cookies.set("token", token.data.token, {expires: cookieDuration});
                Cookies.set("username", token.data.user, {expires: cookieDuration});
                Cookies.set("userid", token.data.id, {expires: cookieDuration});
                window.location.href = "/";
            }
            catch (err){
                alert("Ocorreu um erro, tente novamente mais tarde! "+err);
            }
        }
        else {
            alert("Há campos obrigatórios não preenchidos!");
        }
        formRef.current.reset();
        setFormOpen(false);
        setActionForm("Login");
    }

    function doLogoff() {
        Cookies.remove("token");
        Cookies.remove("username");
        Cookies.remove("userid");
        window.location.href = "/";
    }
    
    async function createUser() {
        let confPass = false;
        if(passView || inputPass.current.value === inputPassConfirm.current.value) {
            confPass = true;
        }
        if(confPass) {
            if(!(inputEmail.current.value && inputPass.current.value && inputName.current.value && inputCPF.current.value && inputTel.current.value)) {
                alert("Há campos obrigatórios não preenchidos!");
            }
            else {
                await api.post("/users", {
                    email: inputEmail.current.value,
                    pass: inputPass.current.value,
                    name: inputName.current.value,
                    cpf: inputCPF.current.value,
                    tel: inputTel.current.value,
                }).catch(function () {
                    alert("Ocorreu um erro, tente novamente mais tarte!");
                });
            }
        }
        else {
            alert("As senhas não coincidem!");
        }
        formRef.current.reset();
        setFormOpen(false);
        setActionForm("Login");
    }

/*
    async function deleteUser(id) {
        await api.delete(`/users/${id}`).catch(function () {
            alert("Ocorreu um erro, tente novamente mais tarte!");
        });
    }
*/
    return (
        <>
            <div className=" fixed top-0 left-0 w-full bg-yellow-800 h-20 grid grid-cols-12 text-center">
                <a href="/" className="col-start-1 col-span-1 px-7 
                    hover:bg-yellow-700"><img src="./src/assets/logo.svg" className="h-20 p-2" /></a>
                <a href="/products" className="col-start-2 col-span-1 py-7 
                    hover:bg-yellow-700">Produtos</a>
                <a href="/about" className="col-start-3 col-span-1 py-7 
                    hover:bg-yellow-700">Sobre</a>
                <a href="/contact" className="col-start-4 col-span-1 py-7 
                    hover:bg-yellow-700">Contato</a>
                {Cookies.get("token")?
                    <><h1 className="content-center text-lg col-start-11 col-span-1 pl-10">Usuário: {Cookies.get("username")}</h1>
                    <button onClick={doLogoff} className="col-start-12 col-span-1 py-7 hover:bg-orange-600">Sair</button></>:
                    <><button onClick={isFormOpen?() => setFormOpen(false):() => setFormOpen(true)} className="col-start-12 col-span-1 py-7 
                        hover:bg-yellow-700">Entrar</button></>}
            </div>
            <div className={isFormOpen ? "bg-yellow-800 fixed top-20 right-0 h-fit w-72 rounded-bl-lg drop-shadow-xl border-dashed border-2 border-yellow-900" : "hidden"}>
                <button onClick={() => setFormOpen(false)} className="float-right hover:bg-orange-600">
                    <img src="./src/assets/close.svg" className="h-10 p-2" /></button>
                <h1 className="text-center text-2xl pl-10">{actionForm}</h1>
                <form className="grid grid-cols-5 w-full content-center p-2" ref={formRef}>
                    <input name="email" placeholder="Email" type="text" autoComplete="off"
                            className="col-span-5 text-center m-2 p-1 text-slate-700 rounded-md" ref={inputEmail} />
                    <input name="pass" placeholder="Senha" type={passView?"text":"password"} autoComplete="off"
                        className="col-span-4 text-center m-2 p-1 text-slate-700 rounded-md" ref={inputPass} />
                    <button type="button" onClick={passView? () => setPassView(false):() => setPassView(true)}>
                        {passView? <img src="./src/assets/viewoff.svg" className="col-span-1 h-6" />:
                        <img src="./src/assets/viewon.svg" className="col-span-1 h-6" />}
                    </button>
                    {actionForm === "Login"? "":
                        <><input name="pass" placeholder="Confirme a Senha" type="password" autoComplete="off"
                            className={passView?"hidden":"col-span-5 text-center m-2 p-1 text-slate-700 rounded-md"} ref={inputPassConfirm}/>
                        <input name="name" placeholder="Nome" type="text" autoComplete="off"
                            className="col-span-5 text-center m-2 p-1 text-slate-700 rounded-md" ref={inputName} />
                        <input name="cpf" placeholder="CPF" type="text" autoComplete="off"
                            className="col-span-5 text-center m-2 p-1 text-slate-700 rounded-md" ref={inputCPF} />
                        <input name="tel" placeholder="Telefone" type="text" autoComplete="off"
                            className="col-span-5 text-center m-2 p-1 text-slate-700 rounded-md" ref={inputTel} /></>
                    }
                    <button type="button" onClick={actionForm === "Cadastro" ? () => setActionForm("Login") : doLogin}
                        className={actionForm === "Login"?"bg-yellow-700 col-span-3 hover:bg-yellow-600 m-2 p-1 rounded-md":
                        "col-span-2 hover:bg-yellow-700 m-2 p-1 rounded-md"}>Login</button>
                    <button type="button" onClick={actionForm === "Login" ? () => setActionForm("Cadastro") : createUser}
                        className={actionForm === "Cadastro"?"bg-yellow-700 col-span-3 hover:bg-yellow-600 m-2 p-1 rounded-md":
                        "col-span-2 hover:bg-yellow-700 m-2 p-1 rounded-md"}>Cadastrar</button>
                </form>
            </div>
        </>
    );
}
