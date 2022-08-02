import "./App.css";
import Header from "./components/Header";
import Drawer from "./components/Drawer";
import Home from "./pages/Home";
import Favorites from "./pages/Favorites";
import AppContext from "./context";

import React, { createContext } from "react";
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
      const cartResponse = await axios.get(
        "https://62d7f2aa9c8b5185c77f90a7.mockapi.io/cart"
      );
      const favoritesResponse = await axios.get(
        "https://62d7f2aa9c8b5185c77f90a7.mockapi.io/favorites"
      );
      const itemsResponse = await axios.get(
        "https://62d7f2aa9c8b5185c77f90a7.mockapi.io/items"
      );
      setIsLoading(false);

      setCartItems(cartResponse.data);
      setFavorites(favoritesResponse.data);
      setItems(itemsResponse.data);
    }

    fetchData();
  }, []);

  const onAddToCart = (obj) => {
    try {
      if (cartItems.find((i) => Number(i.id) === Number(obj.id))) {
        axios.delete(
          `https://62d7f2aa9c8b5185c77f90a7.mockapi.io/cart/${obj.id}`
        );
        setCartItems((prev) =>
          prev.filter((i) => Number(i.id) !== Number(obj.id))
        );
      } else {
        axios.post("https://62d7f2aa9c8b5185c77f90a7.mockapi.io/cart", obj);
        setCartItems((prev) => [...prev, obj]);
      }
    } catch (error) {}
  };

  const onRemoveItem = (id) => {
    axios.delete(`https://62d7f2aa9c8b5185c77f90a7.mockapi.io/cart/${id}`);
    setCartItems((prev) => prev.filter((x) => x.id !== id));
  };

  const onAddToFavorite = async (obj) => {
    try {
      if (favorites.find((objF) => Number(objF.id) === Number(obj.id))) {
        axios.delete(
          `https://62d7f2aa9c8b5185c77f90a7.mockapi.io/favorites/${obj.id}`
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
    return cartItems.find((i) => Number(i.id) === Number(id));
  };

  return (
    <AppContext.Provider
      value={{
        items,
        cartItems,
        favorites,
        isItemAdded,
        onAddToFavorite,
        setCartOpened,
        setCartItems,
      }}
    >
      <div className="wrapper clear">
        {cartOpened && (
          <Drawer
            items={cartItems}
            onClose={() => setCartOpened(false)}
            onRemove={(id) => onRemoveItem(id)}
          />
        )}

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
      </div>
    </AppContext.Provider>
  );
}

export default App;
