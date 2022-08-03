import "./App.css";
import Header from "./components/Header";
import Drawer from "./components/Drawer";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import Orders from "./pages/Orders";

import AppContext from "./context";

import React from "react";
import axios from "axios";
import { Routes, Route } from "react-router-dom";

function App() {
  const [items, setItems] = React.useState([]);
  const [cartItems, setCartItems] = React.useState([]);
  const [favorites, setFavorites] = React.useState([]);
  const [searchValue, setSearchValue] = React.useState("");
  const [cartOpened, setCartOpened] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    async function fetchData() {
      try {
        const [cartResponse, favoritesResponse, itemsResponse] =
          await Promise.all([
            axios.get("https://62d7f2aa9c8b5185c77f90a7.mockapi.io/cart"),
            axios.get("https://62d7f2aa9c8b5185c77f90a7.mockapi.io/favorites"),
            axios.get("https://62d7f2aa9c8b5185c77f90a7.mockapi.io/items"),
          ]);

        setIsLoading(false);
        setCartItems(cartResponse.data);
        setFavorites(favoritesResponse.data);
        setItems(itemsResponse.data);
      } catch (error) {
        alert("Ошибка при запросе данных ;(");
      }
    }

    fetchData();
  }, []);

  const onAddToCart = async (obj) => {
    try {
      const findItem = cartItems.find(
        (item) => Number(item.parentId) === Number(obj.id)
      );
      if (findItem) {
        setCartItems((prev) =>
          prev.filter((item) => Number(item.parentId) !== Number(obj.id))
        );
        await axios.delete(
          `https://62d7f2aa9c8b5185c77f90a7.mockapi.io/cart/${findItem.id}`
        );
      } else {
        setCartItems((prev) => [...prev, obj]);
        const { data } = await axios.post(
          "https://62d7f2aa9c8b5185c77f90a7.mockapi.io/cart",
          obj
        );
        setCartItems((prev) =>
          prev.map((item) => {
            if (item.parentId === data.parentId) {
              return {
                ...item,
                id: data.id,
              };
            }
            return item;
          })
        );
      }
    } catch (error) {
      alert("Ошибка при добавлении в корзину");
      console.error(error);
    }
  };

  const onRemoveItem = (id) => {
    try {
      axios.delete(`https://62d7f2aa9c8b5185c77f90a7.mockapi.io/cart/${id}`);
      setCartItems((prev) =>
        prev.filter((item) => Number(item.id) !== Number(id))
      );
    } catch (error) {
      alert("Ошибка при удалении из корзины");
    }
  };

  const onAddToFavorite = async (obj) => {
    try {
      const findItem = favorites.find(
        (objF) => Number(objF.id) === Number(obj.id)
      );
      if (findItem) {
        axios.delete(
          `https://62d7f2aa9c8b5185c77f90a7.mockapi.io/favorites/${findItem.id}`
        );
        setFavorites((prev) =>
          prev.filter((i) => Number(i.id) !== Number(obj.id))
        );
      } else {
        const { data } = await axios.post(
          "https://62d7f2aa9c8b5185c77f90a7.mockapi.io/favorites",
          obj
        );
        setFavorites((prev) => [...prev, data]);
      }
    } catch (error) {
      alert("Не удалось добавить в фавориты");
    }
  };

  const onChangeSearchInput = (event) => {
    setSearchValue(event.target.value);
  };

  const isItemAdded = (id) => {
    return cartItems.find((i) => Number(i.parentId) === Number(id));
  };

  return (
    <AppContext.Provider
      value={{
        items,
        cartItems,
        favorites,
        isItemAdded,
        onAddToFavorite,
        onAddToCart,
        setCartOpened,
        setCartItems,
      }}
    >
      <div className="wrapper clear">
        <Drawer
          items={cartItems}
          onClose={() => setCartOpened(false)}
          onRemove={(id) => onRemoveItem(id)}
          opened={cartOpened}
        />

        <Header onClickCart={() => setCartOpened(true)} />

        <Routes>
          <Route
            path="/"
            element={
              <Home
                items={items}
                cartItems={cartItems}
                searchValue={searchValue}
                setSearchValue={setSearchValue}
                onChangeSearchInput={onChangeSearchInput}
                onAddToCart={onAddToCart}
                onAddToFavorite={onAddToFavorite}
                isLoading={isLoading}
              />
            }
          ></Route>
        </Routes>

        <Routes>
          <Route
            path="/favorites"
            element={<Favorites onAddToFavorite={onAddToFavorite} />}
          ></Route>
        </Routes>

        <Routes>
          <Route path="/orders" element={<Orders />}></Route>
        </Routes>
      </div>
    </AppContext.Provider>
  );
}

export default App;
