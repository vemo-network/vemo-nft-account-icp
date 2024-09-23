import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import createSagaMiddleware from "redux-saga";
import authSagaSlice from "./auth-saga";
import globalSlice from "./global";
import uiSlice from "./loading";
import { modalService } from "./modal-service";
import rootSaga from "./saga";
import walletSlice from "./wallet";

const rootReducers = combineReducers({
  ui: uiSlice.reducer,
  authSaga: authSagaSlice.reducer,
  modal: modalService.reducer,
  global: globalSlice.reducer,
  wallet: walletSlice.reducer,
});
const sagaMiddleware = createSagaMiddleware();
const persistConfig = {
  key: "authSaga",
  storage,
  whitelist: ["authSaga", "wallet"],
};
const persistedReducer = persistReducer(persistConfig, rootReducers);
const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(sagaMiddleware),
});

sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const persistor = persistStore(store, {});

export default store;
