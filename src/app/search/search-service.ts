import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject } from "rxjs";
import { Stock } from "./search-model";
import { environment } from "../../environments/environment";
import { debounceTime } from 'rxjs/operators';


@Injectable({ providedIn: "root" })
export class SearchService {

  private stocksUpdated = new Subject<Stock[]>();
  private resultstock: Stock[] = [];
  constructor(private http: HttpClient) {}

  getStocks(input: String) {

    const BACKEND_URL = environment.apiUrl + "/search/"+input;
    console.log(BACKEND_URL);
    this.http
      .get<{ count:number, result: Stock[] }>(
        BACKEND_URL
      ).subscribe(resultData => {
        this.resultstock = resultData.result;
        this.stocksUpdated.next([...this.resultstock]);
      });

     return this.stocksUpdated.asObservable();

     /* .subscribe(resultData => {
        this.resultstock = resultData.result;
        this.stocksUpdated.next([...this.resultstock]);
      });*/
  }

 /* getStockUpdateListener() {
    return this.stocksUpdated.asObservable();
  } */

}
