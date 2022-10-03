import { Component, OnInit, OnDestroy,Input,NgZone,Inject, ViewChild } from "@angular/core";
import { Subscription,Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { StockDetails } from "./stock-details.model";
import { StockDetailsService } from "./stock-details.service";
import { StockPrice } from "./stock-price.model";
import { CompanyNews } from "./company-news.model";
import {NgbActiveModal, NgbAlert, NgbModal} from '@ng-bootstrap/ng-bootstrap';
import {MatDialog, MAT_DIALOG_DATA,MatDialogRef} from '@angular/material/dialog';
import { interval } from 'rxjs';
import { MatTabHeader } from "@angular/material/tabs";
import { isInteger } from "@ng-bootstrap/ng-bootstrap/util/util";
import { throwToolbarMixedModesError } from "@angular/material/toolbar";
import * as Highcharts from 'highcharts/highstock';
import { HistoricalData } from "./highcharts.model";
import IndicatorsCore from 'highcharts/indicators/indicators';
import vbp from 'highcharts/indicators/volume-by-price';
import {redditObj} from './reddit.model';
import { RecTrends } from "./trends.model";

declare var require: any;
let Boost = require('highcharts/modules/boost');
let noData = require('highcharts/modules/no-data-to-display');
let More = require('highcharts/highcharts-more');

Boost(Highcharts);
noData(Highcharts);
More(Highcharts);
noData(Highcharts);
IndicatorsCore(Highcharts);
vbp(Highcharts);



@Component({
  selector: "stock-details-component",
  templateUrl: "./stock-details.component.html",
  styleUrls: ["./stock-details.component.css"]
})
export class StockListComponent implements OnInit, OnDestroy {

  info!: StockDetails;
  private candleData!: HistoricalData;
  private hourlyData!: HistoricalData;
  priceinfo!: StockPrice;
  companynews: CompanyNews[] = [];
  companynewsArr: CompanyNews[] = [];
  companynewsArrFirstHalf: CompanyNews[] = [];
  companynewsArrSecondHalf: CompanyNews[] = [];
  trends: RecTrends[] = [];
  priceofstock!: number;
  k:number=0;
  changeinprice!: number;
  percentchange!: number;
  modchangeinprice!: number;
  modpercentchange!: number;
  ipostartDate!: string;
  ticker!: string;

  buysuccessMessage!:string;
  private buySuccess = new Subject<string>();
  redditStuff: redditObj[];
  twitterStuff: redditObj[];
  private redditDataSub!: Subscription;
  private twitterDataSub!: Subscription;
  public redditMentions: number = 0;
  public twitterMentions: number = 0;
  public twitterPositiveMentions: number = 0;
  public twitterNegativeMentions: number = 0;
  public redditNegativeMentions: number = 0;
  public redditPositiveMentions: number = 0;

  private infoSub!: Subscription;
  private pricesSub!: Subscription;
  private newsSub!: Subscription;
  private candleDataSub!: Subscription;
  private hourlyDataSub!: Subscription;
  private trendsDataSub!: Subscription;
  public datetime!:any;
  private _success = new Subject<string>();
  private _removed = new Subject<string>();

  rows : string[]=[];
  staticAlertClosed = false;
  successMessage = '';
  buySellMessage = '';
  removedMessage = '';
  public marketStat: boolean;
  public marketVar: string;
  Highcharts = Highcharts;
  chartConstructor  = 'stockChart';
  chartConstructorTrends  = 'chart';
  chartOptions: Highcharts.Options;
  chartOptionsTrends: Highcharts.Options;
  hourlychartOptions: Highcharts.Options;

  public options: any = {

    title: {
        text: 'Bar series - data sorting'
    },

    yAxis: {
        title: {
            text: ''
        }
    },

    xAxis: {
        type: 'category',
        min: 0,
        labels: {
            // animate: false
        }
    },

    legend: {
        enabled: false
    },

    series: [{
        type: 'bar',
        zoneAxis: 'x',
        zones: [{
            value: 2,
            color: 'red'
        }],
        dataLabels: {
            enabled: true,
            format: '{y:,.2f}'
        },
        dataSorting: {
            enabled: true,
            sortKey: 'y'
        },
        data: [["hello",1],["hello",1],["hello",1],["hello",1],]
    }]

}


  @ViewChild('staticAlert', {static: false}) staticAlert: NgbAlert;
  @ViewChild('selfClosingAlert', {static: false}) selfClosingAlert: NgbAlert;

  constructor(public stockDetailsService: StockDetailsService,private activatedRoute: ActivatedRoute,private modalService: NgbModal,public dialog: MatDialog, private ngZone: NgZone) {
    interval(15000).subscribe(x => {
      this.ngOnInit();
  });
  }

  ngOnInit() {

    this.market();
    console.log("this is for new ticker");
    this._success.subscribe(message => this.successMessage = message);
    this._success.pipe(debounceTime(5000)).subscribe(() => {
      if (this.selfClosingAlert) {
        console.log("this should close")
        this.selfClosingAlert.close();
      }
    });

    this._removed.subscribe(message => this.removedMessage = message);
    this._removed.pipe(debounceTime(5000)).subscribe(() => {
      if (this.selfClosingAlert) {
        console.log("this should close")
        this.selfClosingAlert.close();
      }
    });

    this.activatedRoute.params.subscribe ( val => {
      console.log("this is for new ticker");
      this.ticker =  this.activatedRoute.snapshot.params["ticker"];
      localStorage.setItem("activeTicker",this.ticker);
      this.stockDetailsService.getStockDetails(this.ticker);
      this.stockDetailsService.getStockPrice(this.ticker);
      this.stockDetailsService.getCompanyNews(this.ticker);
      this.stockDetailsService.getHistoricalChartData(this.ticker);
      this.stockDetailsService.getHourlyChartData(this.ticker);
      this.stockDetailsService.getMentionData(this.ticker);
      this.stockDetailsService.getTrends(this.ticker);
      this.stockDetailsService.getPeers(this.ticker).subscribe(response => {

        if(response.peers!=null  || response.peers!=[] || response.peers!=undefined  ) {
        this.rows = response.peers;
     /*  var result = '';
        for (var i = 0; i < this.rows.length; i++) {
        result = result + " <a href='" + "#/details/"+this.rows[i] + "'>"+ this.rows[i] + "</a>";
        }
        console.log("result is "+result);
       let element: HTMLElement = document.getElementsByClassName('peers')[0] as HTMLElement;
       if(element!=undefined) {
        element.innerHTML = result || '{}';
       }  */

      }
      });


      console.log("inside ng oninit");

      this.infoSub = this.stockDetailsService.getStocksfetchedListener()
        .subscribe((info: StockDetails) => {

          console.log("ticker in stock details summary is" + this.ticker);
          this.info = info;

          if(Object.keys(this.info).length!=0) {
          localStorage.setItem(this.info.ticker+"summary",JSON.stringify(this.info));
          //localStorage.setItem(this.ticker+"summary",JSON.stringify(this.info));
          this.ipostartDate= info.ipo.substring(0,10);
          console.log("this.info StockDetails in component");
          console.log(this.info);
          }
        });
        this.pricesSub = this.stockDetailsService.getPricesfetchedListener()
        .subscribe((priceinfo: StockPrice) => {
          this.priceinfo = priceinfo;
          localStorage.setItem(localStorage.getItem("activeTicker")+"price",JSON.stringify(this.priceinfo));
          /*
          this.percentchange = Math.round(priceinfo.dp * 100*Math.random()) / 100;
          this.priceofstock = Math.round(priceinfo.c * 100*Math.random()) / 100;
          this.changeinprice = Math.round(priceinfo.d * 100*Math.random()) / 100;
          this.modpercentchange = Math.abs(Math.round(priceinfo.dp * 100*Math.random()) / 100);
          this.modchangeinprice = Math.abs(Math.round(priceinfo.d * 100*Math.random()) / 100);
          */
          this.percentchange = Math.round(priceinfo.dp * 100) / 100;
          this.priceofstock = Math.round(priceinfo.c * 100) / 100;
          this.changeinprice = Math.round(priceinfo.d * 100) / 100;
          this.modpercentchange = Math.abs(Math.round(priceinfo.dp * 100) / 100);
          this.modchangeinprice = Math.abs(Math.round(priceinfo.d * 100) / 100);

          console.log("this.info priceinfo in component " + this.ticker);
          console.log(this.priceinfo);
        });

        this.newsSub = this.stockDetailsService.getNewsUpdateListener()
        .subscribe((companynews: CompanyNews[]) => {
          this.companynews = companynews;

          for (var i = 0; i < this.companynews.length && this.companynewsArr.length < 20; i++) {
            if (this.companynews[i].datetime!=undefined &&
              this.companynews[i].headline!=undefined &&
              this.companynews[i].image!=undefined &&
              this.companynews[i].url!=undefined) {
                this.companynewsArr.push(this.companynews[i]);
            }
        }

        this.companynewsArrFirstHalf = this.companynewsArr.slice(0,10);
        this.companynewsArrSecondHalf = this.companynewsArr.slice(10,20);

        console.log("this.companynewsArr");
        console.log(this.companynewsArr);
        });


        this.candleDataSub = this.stockDetailsService.getCandleDataListener()
        .subscribe((candleData: HistoricalData) => {
          this.candleData = candleData;
          console.log("this.candleData");
          console.log(this.candleData.o);
          this.setChartOptions(this.candleData);
        });


        this.hourlyDataSub = this.stockDetailsService.getHourlyDataListener()
        .subscribe((hourlyData: HistoricalData) => {
          this.hourlyData = hourlyData;
          this.getLastSixHoursData(this.hourlyData);
          console.log("this.hourly data");
          console.log(this.hourlyData);

        });

        this.redditDataSub = this.stockDetailsService.getRedditDataListener()
        .subscribe((redditData: redditObj[]) => {
          this.redditStuff = redditData;
          this.getAllMentionsData();
          console.log("this.reddit datas");
          console.log(this.redditStuff);

        });

        this.trendsDataSub = this.stockDetailsService.getTrendsUpdateListener()
        .subscribe((trendsdata: RecTrends[]) => {
          this.trends = trendsdata;
          this.getChartforTrends(this.trends);
          console.log("this.trends data");
          console.log(this.trends);

        });


        var currentdate = new Date();
        this.datetime = currentdate.getFullYear() + "-"
                    + (currentdate.getMonth()+1)  + "-"
                    + currentdate.getDate() + " "
                    + currentdate.getHours() + ":"
                    + currentdate.getMinutes() + ":"
                    + currentdate.getSeconds();
    }
    );

  }

  getChartforTrends( trendsForChart : RecTrends[]) {

    var colors = ['#21660a', '#3ecc0e', '#d68d20','#eb2813', '#730f05'];

    console.log("inside getCHart");
    console.log(trendsForChart);
    var strongBuyarr = [];
    var buy = [];
    var hold = [];
    var sell = [];
    var strongsSell = [];

    for(var i=0;i<trendsForChart.length;i++) {
      strongBuyarr[i] = trendsForChart[i].strongBuy;
    }

    for(var i=0;i<trendsForChart.length;i++) {
      buy[i] = trendsForChart[i].buy;
    }

    for(var i=0;i<trendsForChart.length;i++) {
      hold[i] = trendsForChart[i].hold;
    }

    for(var i=0;i<trendsForChart.length;i++) {
      sell[i] = trendsForChart[i].sell;
    }

    for(var i=0;i<trendsForChart.length;i++) {
      sell[i] = trendsForChart[i].sell;
    }

    for(var i=0;i<trendsForChart.length;i++) {
      strongsSell[i] = trendsForChart[i].strongSell;
    }

    this.chartOptionsTrends = {
      chart: {
          type: 'column'
      },
      colors: colors,
      title: {
          text: 'Recommendation Trends'
      },
      xAxis: {
          categories: ['2022-04', '2022-03', '2022-02', '2022-01']
      },
      yAxis: {
          min: 0,
          title: {
              text: 'Analysis'
          },
          stackLabels: {
              enabled: true,
              style: {
                  fontWeight: 'bold',

              }
          }
      },
      legend: {
          align: 'right',
          x: -30,
          verticalAlign: 'bottom',
          y: 25,
          floating: true,
          backgroundColor:
              Highcharts.defaultOptions.legend?.backgroundColor || 'white',
          borderColor: '#CCC',
          borderWidth: 1,
          shadow: false
      },
      tooltip: {
          headerFormat: '<b>{point.x}</b><br/>',
          pointFormat: '{series.name}: {point.y}'
      },
      plotOptions: {
          column: {
              stacking: 'normal',
              dataLabels: {
                  enabled: true
              }
          }
      },
      series: [{
          name: 'Strong Buy',
          data: strongBuyarr,
          type: "column",
      }, {
          name: 'Buy',
          data:  buy,
          type: "column",
      }, {
          name: 'Hold',
          data:  hold,
          type: "column",
      },
      {
        name: 'Sell',
        data:  sell,
        type: "column",
    },
    {
      name: 'Strong Sell',
      data:  strongsSell,
      type: "column",
  },

    ]
  }

  }

  getAllMentionsData() {

    console.log("printing all data");
    console.log(this.redditStuff);
    this.twitterDataSub = this.stockDetailsService.getTwitterDataListener()
        .subscribe((twitterData: redditObj[]) => {
          this.twitterStuff = twitterData;

          for(var i =0;i<this.twitterStuff.length;i++) {
            this.twitterMentions = this.twitterMentions+ this.twitterStuff[i].mention;
            this.twitterPositiveMentions = this.twitterPositiveMentions + this.twitterStuff[i].positiveMention;
            this.twitterNegativeMentions = this.twitterNegativeMentions + this.twitterStuff[i].negativeMention;
          }

          for(var i =0;i<this.redditStuff.length;i++) {
            this.redditMentions = this.redditMentions+ this.redditStuff[i].mention;
            this.redditPositiveMentions = this.redditPositiveMentions+ this.redditStuff[i].positiveMention;
            this.redditNegativeMentions = this.redditNegativeMentions+ this.redditStuff[i].negativeMention;
          }

          console.log("all mentions data to be sent to table");
          console.log(this.redditMentions + " "+ this.twitterMentions + " "+this.redditNegativeMentions+ " "+this.redditPositiveMentions);

        });
  }

  getLastSixHoursData(items: HistoricalData) {
    var data:number[][] =[];
    var hrlydata:number[][] =[];
    var hrlydataasc:number[][] =[];


    for (var i=items.c.length-1; i >=0; i --) {
      data.push([
          items.t[i]*1000,
          items.c[i],
      ]);
    }
  var latest = items.t[items.c.length-1]*1000;
  console.log("epoch date is "+latest);
  var myDate = new Date(latest);
  console.log("current date is "+myDate);
  var last = new Date(myDate.getTime() - (6 * 60 * 60 * 1000));
  console.log("6 hours back is "+last );
  var epoch6hoursback  = (last.getTime()/1000);
  console.log("6 hours back epoch is "+epoch6hoursback );

  for (var i=items.c.length-1; i >=0; i --) {
      if(items.t[i]>= epoch6hoursback) {
        hrlydata.push([
          items.t[i]*1000,
          items.c[i],
      ]);
      }
    }

  hrlydata = hrlydata.reverse();


  console.log("finalData");
  console.log(hrlydata);

  var color;
  if(this.changeinprice>0)
    color = '#56ad05';

  else {
    color = 'red'
  }

  var dateFormat = '%H:%M';
  this.hourlychartOptions = {
    rangeSelector: {
        enabled: false
    },

    navigator: {
      enabled: false
    },

    title: {
        text: this.ticker+ ' Hourly Price Variation',
    },

    series: [{
        name: this.ticker,
        type: 'line',
        data: hrlydata,
        tooltip: {
            valueDecimals: 2
        },
        color: color,
    }],

    xAxis: {
      dateTimeLabelFormats: {

        minute: dateFormat,
        hour: dateFormat,

    },
      labels: {
          rotation: 0
      },
      title: {
          text: "Stock Data"
      },
      type: "datetime",
  },
};
}

  showMarketStatus() {
    var date = new Date();
    var dayOfWeek = date.getDay();
    var isWeekend = (dayOfWeek === 6) || (dayOfWeek  === 0);
    var hours = date.getHours();
    if(hours> 7 && hours <= 13  && isWeekend==false) {
      return true;
    }
    else {
      return false;
    }
  }

  setInnerhtml() {

    var result = '';
        for (var i = 0; i < this.rows.length; i++) {
        result = result + " <a href='" + "#/details/"+this.rows[i] + "'>"+ this.rows[i] + "</a>";
        }
        console.log("result is "+result);
       let element: HTMLElement = document.getElementsByClassName('peers')[0] as HTMLElement;
       if(element!=undefined) {
        element.innerHTML = result || '{}';
       }

  }


/*  fetchChart() {
    console.log("inside fetch chart");
    Highcharts.chart('testchart', this.options);
    return true;
  } */

  market() {
    if(this.showMarketStatus())
      this.marketVar = 'Market is Open';
    else
      this.marketVar = 'Market Closed';
  }

  ngOnDestroy() {
    if(this.infoSub)
      this.infoSub.unsubscribe();
    if(this.pricesSub)
      this.pricesSub.unsubscribe();
    if(this.newsSub)
      this.newsSub.unsubscribe();
      if(this.newsSub)
      this.newsSub.unsubscribe();
      if(this.candleDataSub)
        this.candleDataSub.unsubscribe();
      if(this.hourlyDataSub)
        this.hourlyDataSub.unsubscribe();
        if(this.redditDataSub)
        this.redditDataSub.unsubscribe();
        if(this.twitterDataSub)
        this.twitterDataSub.unsubscribe();
        if(this.trendsDataSub)
        this.trendsDataSub.unsubscribe();
  }

  open() {

    const modalRef = this.modalService.open(NgbdModalContentForBuySell);
    modalRef.componentInstance.ticker =this.ticker;
    modalRef.componentInstance.currentPrice = this.priceofstock;
    modalRef.componentInstance.moneyInWallet = localStorage.getItem("money");
  }


openForSell() {

  const modalRef = this.modalService.open(NgbdModalContentForSell);
  modalRef.componentInstance.ticker =this.ticker;
  modalRef.componentInstance.currentPrice = this.priceofstock;
  modalRef.componentInstance.moneyInWallet = localStorage.getItem("money");

}

setChartOptions(items: HistoricalData): void {

  var ohlc:number[][] =[];
  var volume:number[][] =[];

  for (var i=0; i < items.c.length; i += 1) {
    ohlc.push([
        items.t[i]*1000,
        items.o[i], // the date
        items.h[i], // open
        items.l[i],// high
        items.c[i], // low
    ]);

    volume.push([
      items.t[i]*1000, // the date
      items.v[i], // the volume
    ]);
  }


  console.log("inside sethis");
  console.log(ohlc);
  console.log(volume);

  this.chartOptions = {

    rangeSelector: {
      selected: 2
    },

    title: {
      text: `${this.ticker} Historical`
    },

    subtitle: {
      text: 'With SMA and Volume by Price technical indicators',
      useHTML: true
    },

    time: {
      useUTC: false
    },

    yAxis: [{
      startOnTick: false,
      endOnTick: false,
      labels: {
        align: 'right',
        x: -3
      },
      title: {
        text: 'OHLC'
      },
      height: '60%',
      lineWidth: 2,
      resize: {
        enabled: true
      }
    }, {
      labels: {
        align: 'right',
        x: -3
      },
      title: {
        text: 'Volume'
      },
      top: '65%',
      height: '35%',
      offset: 0,
      lineWidth: 2
    }],

    tooltip: {
      split: true
    },

    plotOptions: {
      series: {
        dataGrouping: {
          units: [[
            'week',
            [1]
          ], [
            'month',
            [1, 2, 3, 4, 6]
          ]]
        }
      }
    },

    series: [{
      type: 'candlestick',
      name: this.ticker,
      id: this.ticker.toLowerCase(),
      zIndex: 2,
      data: ohlc,
      tooltip: {
        valueDecimals: 2
      }
    }, {
      type: 'column',
      name: 'Volume',
      id: 'volume',
      data: volume,
      yAxis: 1
    }, {
      type: 'vbp',
      linkedTo: this.ticker.toLowerCase(),
      params: {
        volumeSeriesID: 'volume'
      },
      dataLabels: {
        enabled: false
      },
      tooltip: {
        valueDecimals: 2
      },
      zoneLines: {
        enabled: false
      }
    }, {
      type: 'sma',
      linkedTo: this.ticker.toLowerCase(),
      zIndex: 1,
      tooltip: {
        valueDecimals: 2
      },
      marker: {
        enabled: false
      },
    }]
  };
}

  areSharesBought() {
    var shares = localStorage.getItem(this.ticker+"boughtQty");
    if(shares!=null)
      return true;
    else
      return false;
  }

  isWatchlisted () {
    if(localStorage.getItem(this.ticker)==="addedToWatchlist")
      return true;
    else
      return false;
  }

  removeFromWatchlist () {
    localStorage.removeItem(this.ticker);
    this._removed.next(this.ticker+` removed from Watchlist.`);
  }

  addToWatchlist() {
    localStorage.setItem(this.ticker, "addedToWatchlist");
    this._success.next(this.ticker+` added to Watchlist.`);
  }

  testBuy() {
    let element: HTMLElement = document.getElementsByClassName('img-responsive')[0] as HTMLElement;
    element.click();
    this.buySuccess.subscribe(message => this.buysuccessMessage = message);
    this.buySuccess.pipe(debounceTime(5000)).subscribe(() => {
      if (this.selfClosingAlert) {
        console.log("this should close")
        this.selfClosingAlert.close();
      }
    });
    this.buySuccess.next(this.ticker+ ' bought successfully');
  }

  testSell() {
    let element: HTMLElement = document.getElementsByClassName('description')[0] as HTMLElement;
    element.click();
    this.buySuccess.subscribe(message => this.buysuccessMessage = message);
    this.buySuccess.pipe(debounceTime(5000)).subscribe(() => {
      if (this.selfClosingAlert) {
        console.log("this should close")
        this.selfClosingAlert.close();
      }
    });
    this.buySuccess.next(this.ticker+ ' sold successfully');
  }

  clicked(x: CompanyNews ) {
    const longEnUSFormatter = new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  longEnUSFormatter.format(new Date(x.datetime * 1000));
  console.log(longEnUSFormatter.format(new Date(x.datetime * 1000)));
    console.log("clicked");
    this.dialog.open(DialogElementsExampleDialog, {
      data: {
        source: x.source,
        datetime: longEnUSFormatter.format(new Date(x.datetime * 1000)),
        headline: x.headline,
        summary: x.summary,
        url: x.url,
        twitterurl: "https://twitter.com/intent/tweet?text="+x.headline+"&url="+x.url,
        facebookurl: "https://www.facebook.com/sharer/sharer.php?u="+x.url,
      }
    });
  }

}

@Component({
  selector: 'dialog-elements-example-dialog',
  templateUrl: 'dialog-elements-example-dialog.html'
})
export class DialogElementsExampleDialog {
  constructor(  private dialogRef: MatDialogRef<DialogElementsExampleDialog>, public dialog: MatDialog, @Inject(MAT_DIALOG_DATA) public data:CompanyNews ) {
  }

  ngOnInit() {
    this.updateSize();
  }

  updateSize() {
    this.dialogRef.updateSize("500px", "500px");
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
      <button type="button" class="btn btn-primary btn-lg" #BuyBtn (click)="Buy(inputforQnty)">Buy</button>
    </div>
  `,
  providers: [StockListComponent],
})
export class NgbdModalContentForBuySell {
  @Input() ticker: any;
  @Input() currentPrice: any;
  @Input() moneyInWallet: any;

  noMoneyError: string = '';
  totalAmnt!: number

  constructor(public activeModal: NgbActiveModal, public stockListComponent: StockListComponent) {}

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

    this.stockListComponent.testBuy();

    this.activeModal.close('Close click');
  }

  ngOnInit() {
    let element: HTMLButtonElement = document.getElementsByClassName('btn-primary')[0] as HTMLButtonElement;
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
      <button type="button" class="btn btn-primary btn-lg" #SellBtn (click)="Sell(inputforQnty)">Sell</button>
    </div>
  `,
  providers: [StockListComponent],
})
export class NgbdModalContentForSell {
  @Input() ticker: any;
  @Input() currentPrice: any;
  @Input() moneyInWallet: any;

  noStocksError: string = '';
  totalAmnt!: number

  constructor(public activeModal: NgbActiveModal, public stockListComponent: StockListComponent) {}

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
    this.stockListComponent.testSell();
    this.activeModal.close('Close click');

  }

  ngOnInit() {
    let element: HTMLButtonElement = document.getElementsByClassName('btn-primary')[0] as HTMLButtonElement;
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
      this.noStocksError = 'You cannot sell the stocks that you don\'t have!';
      SellBtn.disabled = true;
    }
    else {
      this.noStocksError = '';
    }

  }
}




