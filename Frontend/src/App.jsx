import { useEffect, useState } from "react";
import axios from "axios";

function App() {

  const [user, setUser] = useState(null);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);

  const [editingProductId, setEditingProductId] = useState(null);

  const [loginData, setLoginData] = useState({
    username: "",
    password: ""
  });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: ""
  });

  const fetchProducts = () => {
    axios.get("http://localhost:8080/products", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((response) => setProducts(response.data))
      .catch((error) => console.error("Error al obtener productos:", error));
  };

  const fetchCategories = () => {
    axios.get("http://localhost:8080/categories", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error al obtener categorías:", error));
  };

  useEffect(() => {
    if (user) {
      fetchProducts();
      fetchCategories();
    }
  }, [user]);

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value
    });
  };

  const handleProductChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:8080/auth/login",
        loginData
      );

      localStorage.setItem("token", response.data.token);

      setUser({
        username: response.data.username,
        role: response.data.role,
        token: response.data.token
      });

    } catch (error) {
      console.error(error);
      alert("Usuario o contraseña incorrectos");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");

    setUser(null);
    setProducts([]);
    setEditingProductId(null);

    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      categoryId: ""
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const productData = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      stock: Number(formData.stock),
      category: formData.categoryId
        ? { id: Number(formData.categoryId) }
        : null
    };

    try {

      if (editingProductId) {

        await axios.put(
          `http://localhost:8080/products/${editingProductId}`,
          productData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );

        setEditingProductId(null);

      } else {

        await axios.post(
          "http://localhost:8080/products",
          productData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`
            }
          }
        );
      }

      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        categoryId: ""
      });

      fetchProducts();

    } catch (error) {
      console.error("Error al guardar producto:", error);
    }
  };

  const handleDelete = async (id) => {

    try {

      await axios.delete(
        `http://localhost:8080/products/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`
          }
        }
      );

      fetchProducts();

    } catch (error) {
      console.error("Error al eliminar producto:", error);
    }
  };

  const handleEdit = (product) => {

    setEditingProductId(product.id);

    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      categoryId: product.category ? product.category.id : ""
    });
  };

  const cancelEdit = () => {

    setEditingProductId(null);

    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      categoryId: ""
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-white">

        <form
          onSubmit={handleLogin}
          className="bg-zinc-900 p-8 rounded-2xl w-96 shadow-lg border border-zinc-800"
        >

          <h1 className="text-3xl font-bold mb-2 text-center">
            StockFlow
          </h1>

          <p className="text-zinc-400 text-center mb-6">
            Ingresá para gestionar el inventario
          </p>

          <input
            type="text"
            name="username"
            placeholder="Usuario"
            value={loginData.username}
            onChange={handleLoginChange}
            className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 mb-4 focus:outline-none focus:border-blue-500"
          />

          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={loginData.password}
            onChange={handleLoginChange}
            className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 mb-6 focus:outline-none focus:border-blue-500"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-xl font-semibold"
          >
            Ingresar
          </button>

        </form>
      </div>
    );
  }

  const isAdmin = user.role === "ADMIN";

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-8">

      <div className="max-w-6xl mx-auto">

        <div className="flex items-center justify-between mb-10">

          <div>

            <h1 className="text-5xl font-bold mb-2">
              StockFlow
            </h1>

            <p className="text-zinc-400">
              Bienvenido, {user.username} · Rol:
              <span className="text-blue-400"> {user.role}</span>
            </p>

          </div>

          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 transition px-5 py-3 rounded-xl font-semibold"
          >
            Cerrar sesión
          </button>

        </div>

        <div className="grid md:grid-cols-3 gap-6">

          <div className="bg-zinc-900 p-6 rounded-2xl shadow-lg border border-zinc-800">

            <h2 className="text-2xl font-semibold mb-6">
              {editingProductId ? "Editar producto" : "Crear producto"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">

              <input
                type="text"
                name="name"
                placeholder="Nombre"
                value={formData.name}
                onChange={handleProductChange}
                className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-blue-500"
              />

              <input
                type="text"
                name="description"
                placeholder="Descripción"
                value={formData.description}
                onChange={handleProductChange}
                className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-blue-500"
              />

              <input
                type="number"
                name="price"
                placeholder="Precio"
                value={formData.price}
                onChange={handleProductChange}
                className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-blue-500"
              />

              <input
                type="number"
                name="stock"
                placeholder="Stock"
                value={formData.stock}
                onChange={handleProductChange}
                className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-blue-500"
              />

              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleProductChange}
                className="w-full p-3 rounded-xl bg-zinc-800 border border-zinc-700 focus:outline-none focus:border-blue-500"
              >
                <option value="">Seleccionar categoría</option>

                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 transition p-3 rounded-xl font-semibold"
              >
                {editingProductId ? "Guardar cambios" : "Crear producto"}
              </button>

              {editingProductId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="w-full bg-zinc-700 hover:bg-zinc-600 transition p-3 rounded-xl font-semibold"
                >
                  Cancelar edición
                </button>
              )}

            </form>
          </div>

          <div className="md:col-span-2 bg-zinc-900 p-6 rounded-2xl shadow-lg border border-zinc-800">

            <div className="flex items-center justify-between mb-6">

              <h2 className="text-2xl font-semibold">
                Productos
              </h2>

              <span className="bg-zinc-800 px-4 py-2 rounded-xl text-sm">
                {products.length} productos
              </span>

            </div>

            {products.length === 0 ? (

              <div className="text-zinc-400">
                No hay productos cargados
              </div>

            ) : (

              <div className="grid gap-4">

                {products.map((product) => (

                  <div
                    key={product.id}
                    className="bg-zinc-800 p-5 rounded-2xl border border-zinc-700"
                  >

                    <div className="flex items-center justify-between mb-3">

                      <h3 className="text-xl font-semibold">
                        {product.name}
                      </h3>

                      <span className="bg-blue-600 px-3 py-1 rounded-lg text-sm">
                        Stock: {product.stock}
                      </span>

                    </div>

                    <p className="text-zinc-400 mb-4">
                      {product.description}
                    </p>

                    <p className="text-sm text-blue-400 mb-4">
                      Categoría: {product.category ? product.category.name : "Sin categoría"}
                    </p>

                    <div className="text-2xl font-bold text-green-400">
                      ${product.price}
                    </div>

                    {isAdmin && (

                      <div className="mt-4 flex gap-3">

                        <button
                          onClick={() => handleEdit(product)}
                          className="bg-yellow-500 hover:bg-yellow-600 transition px-4 py-2 rounded-xl font-semibold text-black"
                        >
                          Editar
                        </button>

                        <button
                          onClick={() => handleDelete(product.id)}
                          className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-xl font-semibold"
                        >
                          Eliminar
                        </button>

                      </div>
                    )}

                    {!isAdmin && (
                      <p className="text-sm text-zinc-500 mt-4">
                        Solo un administrador puede editar o eliminar.
                      </p>
                    )}

                  </div>
                ))}

              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
}

export default App;