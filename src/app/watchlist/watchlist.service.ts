import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { StockDetails } from "../StockDetails/stock-details.model";
import { StockPrice } from "../StockDetails/stock-price.model";
import { environment } from "../../environments/environment";
import { debounceTime } from 'rxjs/operators';


@Injectable({ providedIn: "root" })
export class WatchlistService {

  private info!: StockDetails;
  private priceinfo!: StockPrice;
  constructor(private http: HttpClient) {}

  getStockDetails(input: String) {

    const BACKEND_URL = environment.apiUrl + "/summary/"+input;
    console.log(BACKEND_URL);
    return this.http.get<{ message: String, info: StockDetails }>( BACKEND_URL);

  }

  getStockPrice(ticker: String) {
    const BACKEND_URL = environment.apiUrl + "/details/"+ticker;
    return this.http.get<{ message: String, priceinfo: StockPrice }>(BACKEND_URL);
  }


}
