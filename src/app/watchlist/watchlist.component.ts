import { Component } from "@angular/core";
import { Router } from '@angular/router';
import {WatchlistService} from './watchlist.service';
import { StockDetails } from "../StockDetails/stock-details.model";
import { StockPrice } from "../StockDetails/stock-price.model";
import { Watchlistcard } from "./watchlist.model";


@Component({
  selector: "watch-list",
  templateUrl: "./watchlist.component.html",
  styleUrls: ["./watchlist.component.css"]
})

export class WatchlistComponent {

  watchlength: number;
  watchlisted: string[] = [];
  watchlistinfo: Watchlistcard[] = [];
  info: StockDetails[]= [];
  priceinfo!: StockPrice;
  k:number=0;

  constructor(private router: Router,public watchlistService: WatchlistService) {}
  ngOnInit() {

    console.log("inside ngoninit - local storage length is"+ localStorage.length);

    this.k=0;
    this.watchlisted = [];
    this.watchlistinfo = [];
    for (var i = 0; i < localStorage.length; i++){
      const kl = localStorage.getItem(localStorage.key(i) || '{}');
      if(kl==='addedToWatchlist') {
        this.watchlisted[this.k++]=localStorage.key(i) || '{}';
      }

    }
    console.log("watchlisted length is"+ this.watchlisted.length);
    console.log("wattchlisted "+ this.watchlisted);

    for (var i = 0; i < this.watchlisted.length; i++) {

      var stockpricedata = JSON.parse(localStorage.getItem(this.watchlisted[i]+"price") || '{}');
      var stocksummarydata = JSON.parse(localStorage.getItem(this.watchlisted[i]+"summary") || '{}');

      const wl =
      {
        ticker: stocksummarydata.ticker,
        name: stocksummarydata.name,
        c: Math.round(stockpricedata.c * 100) / 100,
        d: Math.round(stockpricedata.d * 100) / 100,
        dp: Math.round(stockpricedata.dp * 100) / 100,
        modd: Math.abs(Math.round(stockpricedata.d * 100) / 100),
        moddp: Math.abs(Math.round(stockpricedata.dp * 100) / 100),

      };

      this.watchlistinfo.push(wl);

    }
    console.log(this.watchlistinfo);
  }

  clicked(item: string) {
    console.log("inside clicked")
    localStorage.removeItem(item);
    console.log("local storage length is"+ localStorage.length);
    this.ngOnInit();
  }

  navigate(item: string) {
  this.router.navigate(['/details', item ]);
  }

}
