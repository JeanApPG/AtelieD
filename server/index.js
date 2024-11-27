import express from "express";
import cors from "cors";
import { PrismaClient } from "@prisma/client";
import * as argon2 from "argon2";
import Jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cors("http://localhost:3001"));

function tokenValidate(req, res, next) {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    if(token) {
        const secret = process.env.SECRET;
        try {
                Jwt.verify(token, secret);
                next();
            }
        catch {
            res.status(400).json({ msg: "Token inválido!" });
        }
    }
    else {
        res.status(401).json({ msg: "Acesso negado!" });
    }
}

app.get("/products", async (req, res) => {
    let products = await prisma.product.findMany();
    res.status(200).json(products);
});

app.get("/cart", tokenValidate, async (req, res) => {
    console.log("Ok");
    res.status(200).json({ msg: "Ok"});
});

app.get("/users", async (req, res) => {
    let users = [];
    if(req.query) {
        users = await prisma.user.findMany({
            where: {
                email: req.query.email,
                name: req.query.name,
                cpf: req.query.cpf,
                tel: req.query.tel
            }
        });
    }
    else {
        users = await prisma.user.findMany();
    }
    res.status(200).json(users);
});

app.post("/auth/login", async (req, res) => {
    const { email, pass } = req.body;
    if(email && pass) {
        const user = await prisma.user.findUnique({
            where: {
                email: email
            }});
        if(user) {
            const checkPass = await argon2.verify(user.pass, pass);
            if (checkPass) {
                try {
                    const secret = process.env.SECRET;
                    const token = Jwt.sign(
                        {
                            id: user.id,
                            name: user.name
                        },
                        secret
                    );
                    res.status(200).json({ token, id: user.id, user: user.name });
                }
                catch(err) {
                    res.status(500).json({ msg: "Ocorreu um erro interno, tente novamente mais tarde!"});
                }
            }
            else {
                res.status(422).json({ msg: "Senha inválida!"});
            }
        }
        else {
            res.status(404).json({ msg: "Não existe usuário com este email!"});
        }
    }
    else {
        res.status(422).json({ msg: "Há campos obrigatórios não preenchidos!"});
    }
});

app.post("/auth/rank", tokenValidate, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: req.body.id
            }});
        if(user.rank) {
            res.status(200).json({ rank: user.rank });
        }
    }
    catch(err) {
        res.status(401).json({ msg: "Acesso negado!" });
    }
});

app.post("/users", async (req, res) => {
    const { email, name, pass, cpf, tel } = req.body;
    if(email && name && pass && cpf && tel) {
        const emailExist = await prisma.user.findUnique({
            where: {
                email: email
            }
        });
        const hash = await argon2.hash(pass);
        if(!emailExist) {
            await prisma.user.create({
                data: {
                    email: email,
                    pass: hash,
                    name: name,
                    cpf: cpf,
                    tel: tel
                }
            });
            res.status(201).json({ msg: "Usuário criado com sucesso!"});
        }
        else {
            res.status(422).json({ msg: "Esse email já existe!"});
        }
    }
    else {
        res.status(422).json({ msg: "Há campos obrigatórios não preenchidos!"});
    }
});

app.put("/users/:id", tokenValidate, async (req, res) => {
    await prisma.user.update({
        where:{
            id: req.params.id
        },
        data: {
            email: req.body.email,
            name: req.body.name
        }
    });
    res.status(201).json({ msg: "Usuário atualizado com sucesso!"});
});

app.delete("/users/:id", tokenValidate, async (req, res) => {
    await prisma.user.delete({
        where:{
            id: req.params.id
        }
    });
    res.status(201).json({message: "Usuário deletado com sucesso!"});
});

app.listen(3000);