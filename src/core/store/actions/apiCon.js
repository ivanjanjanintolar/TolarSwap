import axios from 'axios';
import { REACT_APP_API_URL } from '../../utils/common';

export const apiUrlHttp = REACT_APP_API_URL();

export const con = axios.create({
  baseURL: apiUrlHttp,
  timeout: 40000,
})

export default con;
