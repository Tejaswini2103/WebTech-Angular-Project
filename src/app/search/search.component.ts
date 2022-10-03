import {Component} from '@angular/core';
import {FormControl} from '@angular/forms';
import {Stock} from './search-model';
import { Subject, Subscription } from 'rxjs';
import {SearchService} from './search-service';
import { Router } from '@angular/router';
import {  ViewChild} from '@angular/core';
import {StockDetailsService } from '../StockDetails/stock-details.service';
import { debounceTime,map,distinctUntilChanged ,switchMap} from 'rxjs/operators';

/**
 * @title Simple autocomplete
 */
@Component({
  selector: 'Search-Component',
  templateUrl: 'search.component.html',
  styleUrls: ['search.component.css'],
})
export class SearchComponent {
  result: Stock[] = [];
  private resultSub!: Subscription;
  private ticker!: string;
  @ViewChild('searchBar') inputName!: any;
  constructor(public searchService: SearchService, public stockDetailsService: StockDetailsService, private router: Router) {}
  public userInput!: string;
  private callautocomplete = new Subject<string>();
  public tempfield = 'set';

  ngOnInit() {
    console.log("first statement of ngoninit");

    this.resultSub = this.callautocomplete.pipe( debounceTime(500),  distinctUntilChanged(), switchMap((input) => this.searchService.getStocks(input as string))).subscribe((result: Stock[]) => {
      this.result = result;
      console.log("printing result");
      console.log(this.result);
    });


  }


  changeInput(input: string): void {
    this.userInput = input.trim();
    input = input.trim();
    if (this.userInput) {
      this.callautocomplete.next(input);
    }
    console.log("before calling");
    console.log(this.userInput);

/*
    this.searchService.getStocks(this.userInput);
    this.resultSub = this.searchService.getStockUpdateListener()
      .subscribe((result: Stock[]) => {
        this.result = result;
        console.log(this.result);
      });
*/

  }


  ngOnDestroy() {
    if (this.resultSub) {
    this.resultSub.unsubscribe();
    }
  }

  selectedOption(ticker: string): void {
    this.ticker = ticker;
    this.navigateToDetails();
  }


  navigateToDetails(): void {
  /*  if (this.ticker) {
      console.log(this.ticker);
      this.tempfield = 'set';
      this.router.navigate(['/details', this.ticker]);

    } */

      if(this.userInput!=undefined) {
      console.log("inside navigatetodetails undefined");
      console.log(this.userInput);
      this.tempfield = 'set';
      this.ticker = this.userInput;
  /*    this.stockDetailsService.getStockDetails(this.ticker);
      this.stockDetailsService.getStockPrice(this.ticker);
      this.stockDetailsService.getCompanyNews(this.ticker); */
     // localStorage.setItem()
      this.router.navigate(['/details', this.ticker]);
      console.log("inside undefined");
      console.log(this.ticker);
      }
      else {
        this.tempfield = 'unset';
      }
  }

  handleClear(): void {
    this.inputName.nativeElement.value = ' ';
  }



}
