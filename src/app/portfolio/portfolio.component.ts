import { Component,Input, ViewChild } from "@angular/core";
import {NgbActiveModal, NgbModal,NgbAlert} from '@ng-bootstrap/ng-bootstrap';
import { StockDetails } from "../StockDetails/stock-details.model";
import { StockPrice } from "../StockDetails/stock-price.model";
import { PortfolioCard } from "./portfolio.model";
import { StockListComponent} from "../StockDetails/stock-details.component";
import { Subscription,Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { Router } from '@angular/router';


@Component({
  selector: "portfolio",
  templateUrl: "./portfolio.component.html",
  styleUrls: ["./portfolio.component.css"]
})

export class PortfolioComponent {

  portfolioInfo: PortfolioCard[] =[];
  stocksBought: string[] = [];
  info: StockDetails[]= [];
  priceinfo!: StockPrice;
  k:number;
  ticker!:string;
  moneyInWallet!:string;
  buysuccessMessage!:string;
  private buySuccess = new Subject<string>();

  @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert;

  constructor(private modalService: NgbModal, private router: Router) {}


  ngOnInit() {

    this.moneyInWallet = localStorage.getItem("money") || '{}';

    console.log("inside ngoninit - local storage length is"+ localStorage.length);

    this.k=0;
    this.portfolioInfo = [];
    this.stocksBought = [];
    for (var i = 0; i < localStorage.length; i++){

      if(localStorage.key(i)?.includes("boughtQty"))  {

        var kl = localStorage.key(i);
        this.ticker = kl?.substring(0,kl.indexOf("boughtQty"))!;
        this.stocksBought[this.k++]= this.ticker!;

    }

  }

  for (var i = 0; i < this.stocksBought.length; i++) {

    var stockpricedata = JSON.parse(localStorage.getItem(this.stocksBought[i]+"price") || '{}');
    var stocksummarydata = JSON.parse(localStorage.getItem(this.stocksBought[i]+"summary") || '{}');

    const wl =
    {
      ticker: stocksummarydata.ticker,
      name: stocksummarydata.name,
      Quantity: JSON.parse(localStorage.getItem(this.stocksBought[i]+"boughtQty") || '{}'),
      TotalCost: JSON.parse(localStorage.getItem(this.stocksBought[i]+"totalCost") || '{}'),
      AvgCost: (JSON.parse(localStorage.getItem(this.stocksBought[i]+"totalCost") || '{}'))/(JSON.parse(localStorage.getItem(this.stocksBought[i]+"boughtQty") || '{}')),
      CurrentPrice: Math.round(stockpricedata.c * 100) / 100,
      Change: (JSON.parse(localStorage.getItem(this.stocksBought[i]+"totalCost") || '{}'))/(JSON.parse(localStorage.getItem(this.stocksBought[i]+"boughtQty") || '{}'))-Math.round(stockpricedata.c * 100) / 100,
      MarketVal: (Math.round(stockpricedata.c * 100) / 100)*(JSON.parse(localStorage.getItem(this.stocksBought[i]+"boughtQty") || '{}')),
    };

    this.portfolioInfo.push(wl);

  }

  console.log(this.portfolioInfo);

  }

  navigateToDetails(x: string) {
    this.router.navigate(['/details', x ]);
  }

  openForSell(ticker: string, Currprice:number) {

  const modalRef = this.modalService.open(NgbdModalContent);
  modalRef.componentInstance.ticker = ticker;
  modalRef.componentInstance.currentPrice = Currprice;
  modalRef.componentInstance.moneyInWallet = localStorage.getItem("money");
  }

  openForBuy(ticker: string, Currprice:number) {
    const modalRef = this.modalService.open(NgbdModalContentForBuy);
    modalRef.componentInstance.ticker = ticker;
    modalRef.componentInstance.currentPrice = Currprice;
    modalRef.componentInstance.moneyInWallet = localStorage.getItem("money");
    }


    testBuy() {
      let element: HTMLElement = document.getElementsByClassName('avgcost')[0] as HTMLElement;

      element.click();
      this.buySuccess.subscribe(message => this.buysuccessMessage = message);
      this.buySuccess.pipe(debounceTime(5000)).subscribe(() => {
        if (this.selfClosingAlert) {
          console.log("this should close")
          this.selfClosingAlert.close();
        }
      });
      this.buySuccess.next('Stock bought successfully');
      this.ngOnInit();
    }

    testSell(x: string) {
      let element: HTMLElement = document.getElementsByClassName('quantity')[0] as HTMLElement;
      element.click();
      this.buySuccess.subscribe(message => this.buysuccessMessage = message);
      this.buySuccess.pipe(debounceTime(5000)).subscribe(() => {
        if (this.selfClosingAlert) {
          console.log("this should close")
          this.selfClosingAlert.close();
        }
      });
      this.buySuccess.next('Stock sold successfully');
      this.ngOnInit();
    }

}

@Component({
  selector: 'ngbd-modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{ticker}}</h4>
      <button type="button" class="btn" (click)="activeModal.close('Close click')">X</button>
    </div>
    <div class="modal-body">
      <p> Current Price: {{currentPrice}}</p>
      <p> Money In Wallet: {{moneyInWallet}}</p>
      Quantity: <input type="number" id="myNumber" value="0" #inputforQnty (click)="validate(inputforQnty, SellBtn)"/>
      <p *ngIf="noStocksError!=''" style="color: red;"> {{noStocksError}} </p>
    </div>
    <div class="modal-footer">
      <p *ngIf="totalAmnt!=undefined" style="float: left; position:relative;bottom: 2px;left: -280px; "> Total: {{totalAmnt}} </p>
      <button type="button" class="btn btn-primary btn-lg" #SellBtn name = "sellbutton" (click)="Sell(inputforQnty)">Sell</button>
    </div>
  `,
  providers: [StockListComponent,PortfolioComponent],
})
export class NgbdModalContent {
  @Input() ticker: any;
  @Input() currentPrice: any;
  @Input() moneyInWallet: any;

  noStocksError: string = '';
  totalAmnt!: number

  constructor(public activeModal: NgbActiveModal, public stockListComponent: StockListComponent, public portfolioComponent: PortfolioComponent) {}

  Sell(inputforQnty: HTMLInputElement) {

    var money = localStorage.getItem("money");
    var wallet: number = +money!
    var y: number = +inputforQnty.value;
    wallet = wallet + (y*this.currentPrice);
    localStorage.setItem("money",(Math.round(wallet * 100) / 100).toString());

      var Quantity = localStorage.getItem(this.ticker+"boughtQty");
      var quantityInInt: number = +Quantity!;
      var totalsharesleft = quantityInInt-y;
      if(totalsharesleft===0) {
        localStorage.removeItem(this.ticker+"boughtQty");
        localStorage.removeItem(this.ticker+"totalCost");
      }
      else {
        localStorage.setItem(this.ticker+"boughtQty",totalsharesleft.toString());
      this.totalAmnt = Math.round(y*this.currentPrice * 100) / 100;
      var prevprice = localStorage.getItem(this.ticker+"totalCost");
      var prevpriceInInt: number = +prevprice!;
      var avgPrice = Math.round((prevpriceInInt/quantityInInt)*100)/100;
      var totalCost = prevpriceInInt-(y*avgPrice);
      localStorage.setItem(this.ticker+"totalCost",totalCost.toString());

      }
    this.portfolioComponent.testSell(this.ticker);

    this.activeModal.close('Close click');

  }

  ngOnInit() {
    let element: HTMLButtonElement = document.getElementsByName('sellbutton')[0] as HTMLButtonElement;
    element.disabled = true;
  }

  validate(inputforQnty: HTMLInputElement,SellBtn: HTMLButtonElement) {

    SellBtn.disabled = false;

    console.log("calculating");
    console.log(inputforQnty.value);



    var qnty = localStorage.getItem(this.ticker+"boughtQty");
    var qntyInInt: number = +qnty!;
    var y: number = +inputforQnty.value;

    if(y<0) {
      SellBtn.disabled = true;
    }

    this.totalAmnt = Math.round(y*this.currentPrice * 100) / 100;
    if(qntyInInt< y) {
      this.noStocksError = "You can't sell the stocks that you don't have";
      SellBtn.disabled = true;
    }
    else {
      this.noStocksError = '';
    }

  }
}

@Component({
  selector: 'ngbd-modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">{{ticker}}</h4>
      <button type="button" class="btn" (click)="activeModal.close('Close click')">X</button>
    </div>
    <div class="modal-body">
      <p> Current Price: {{currentPrice}}</p>
      <p> Money In Wallet: {{moneyInWallet}}</p>
      Quantity: <input type="number" id="myNumber" value="0" #inputforQnty (click)="validate(inputforQnty, BuyBtn)">
      <p *ngIf="noMoneyError!=''" style="color: red;"> {{noMoneyError}} </p>
    </div>
    <div class="modal-footer">
      <p *ngIf="totalAmnt!=undefined" style="float: left; position:relative;bottom: 2px;left: -280px; "> Total: {{totalAmnt}} </p>
      <button type="button" class="btn btn-primary btn-lg" #BuyBtn name="buybutton"  (click)="Buy(inputforQnty)">Buy</button>
    </div>
  `,
  providers: [StockListComponent, PortfolioComponent],
})
export class NgbdModalContentForBuy {
  @Input() ticker: any;
  @Input() currentPrice: any;
  @Input() moneyInWallet: any;

  noMoneyError: string = '';
  totalAmnt!: number

  constructor(public activeModal: NgbActiveModal, public stockListComponent: StockListComponent, public portfolioComponent: PortfolioComponent) {}

  Buy(inputforQnty: HTMLInputElement) {

    var money = localStorage.getItem("money");
    var wallet: number = +money!
    var y: number = +inputforQnty.value;
    wallet = wallet - (y*this.currentPrice);

    localStorage.setItem("money",(Math.round(wallet * 100) / 100).toString());

    if(localStorage.getItem(this.ticker+"boughtQty")===null) {
      localStorage.setItem(this.ticker+"boughtQty",inputforQnty.value);
      localStorage.setItem(this.ticker+"totalCost",(y*this.currentPrice).toString());
    }
    else {
      var Quantity = localStorage.getItem(this.ticker+"boughtQty");
      var quantityInInt: number = +Quantity!;
      var totalsharesbought = quantityInInt+y;
      localStorage.setItem(this.ticker+"boughtQty",totalsharesbought.toString());
      var prevprice = localStorage.getItem(this.ticker+"totalCost");
      var prevpriceInInt: number = +prevprice!;
      var currPrice = this.currentPrice;
      var currPriceInInt : number = +currPrice!;
      var totalCost = prevpriceInInt+(currPriceInInt*y);
      localStorage.setItem(this.ticker+"totalCost",totalCost.toString());
    }

    this.portfolioComponent.testBuy();


    this.activeModal.close('Close click');
  }

  ngOnInit() {
    let element: HTMLButtonElement = document.getElementsByName('buybutton')[0] as HTMLButtonElement;
    element.disabled = true;
  }

  validate(inputforQnty: HTMLInputElement,BuyBtn: HTMLButtonElement) {

    BuyBtn.disabled = false;
    console.log("calculating");
    console.log(inputforQnty.value);

    var y: number = +inputforQnty.value;

    if(y<0) {
      BuyBtn.disabled = true;
    }
    console.log(y*this.currentPrice);
    this.totalAmnt = Math.round(y*this.currentPrice * 100) / 100;


    if((y*this.currentPrice) > this.moneyInWallet) {
      this.noMoneyError = 'Not enough money in wallet!';
      BuyBtn.disabled = true;
    }
    else {
      this.noMoneyError = '';
    }
  }
}


