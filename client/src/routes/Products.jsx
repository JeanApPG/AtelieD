import { useState , useEffect} from "react";
import { api } from "../services/api.js";
import Cookies from "js-cookie";

export function Products() {
    const [products, setProducts] = useState([]);
    const [userRank, setUserRank] = useState(false);

    async function getProducts() {
        const productsFromAPI = await api.get("/products");
        setProducts(productsFromAPI.data);
    }

    async function getUserRank() {
        if (Cookies.get("userid")) {
            try {
                const userid = Cookies.get("userid");
                const userRankFromAPI = await api.post("/auth/rank", {
                    id: userid
                }, {
                    headers: {
                        "Authorization": `Bearer ${Cookies.get("token")}`
                    }
                });
                setUserRank(userRankFromAPI.data.rank);
            }
            catch {
                return;
            }
        }
        else {
            return;
        }
    }
    
    useEffect(() => {
        getProducts();
        getUserRank();
    }, []);

    return (
        <div className="grid grid-cols-5 gap-4 p-8">
            {Cookies.get("username")?<h1 className="col-span-5 text-4xl text-center pb-8">Bem vindo(a), {Cookies.get("username")}</h1>:""}
            {
                userRank?<h1 className="col-span-5 text-4xl text-center pb-8">Adicione Produtos</h1>:""
            }
            <h1 className="col-span-5 text-4xl text-center pb-8">Confira nossos produtos!</h1>
            {
                products.map((product) => (
                    <div key={product.id} className="bg-yellow-800 rounded-lg text-center h-fit">
                        <p className="pt-4 text-yellow-100">{product.name}</p>
                        <img src="/src/imgs/teste.jpg"/*{"/src/imgs/"+product.id+".jpg"}*/ className="h-40 object-contain object-center rounded-3xl block mx-auto my-4"/>
                        <p className="pb-4 text-yellow-100">R${product.price}</p>
                        <div className="bg-yellow-100 rounded-b-lg h-auto">
                            <p className="p-2 text-yellow-800 font-semibold">{product.description}</p>
                        </div>
                    </div>
                ))
            }
        </div>
    );
}