import { all } from "redux-saga/effects";
import { authSagas } from "./saga-auth";

/**
 * rootSaga
 */
export default function* rootSaga() {
  yield all([...authSagas]);
}
