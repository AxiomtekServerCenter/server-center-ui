import { useSelector as useReduxSelector, useDispatch } from "react-redux";

export const useSelector = useReduxSelector;
export const useAppDispatch = () => useDispatch();
