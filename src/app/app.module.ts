import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { MatInputModule } from "@angular/material/input";
import { MatButtonModule } from "@angular/material/button";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatExpansionModule } from "@angular/material/expansion";
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import  { HeaderComponent} from './header/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import  { PostListComponent} from './posts-list/posts-list.component';
import { MatFormFieldModule } from "@angular/material/form-field";
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSelectModule} from '@angular/material/select';
import {ReactiveFormsModule} from '@angular/forms';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import { SearchComponent} from './search/search.component';
import { StockListComponent} from './StockDetails/stock-details.component';
import {WatchlistComponent} from './watchlist/watchlist.component';
import {PortfolioComponent} from './portfolio/portfolio.component';
import {MatTabsModule} from '@angular/material/tabs';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';
import {MatDialogModule} from '@angular/material/dialog';
import {DialogElementsExampleDialog } from './StockDetails/stock-details.component';
import {MatCardModule} from '@angular/material/card';
import { RouterModule, Routes } from '@angular/router';
import { NgbdModalContent} from './portfolio/portfolio.component';
import {NgbdModalContentForBuySell } from './StockDetails/stock-details.component';
import {NgbdModalContentForSell } from './StockDetails/stock-details.component';
import { NgbdModalContentForBuy } from './portfolio/portfolio.component';
import { HighchartsChartModule } from 'highcharts-angular';


@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    PostListComponent,
    SearchComponent,
    StockListComponent,
    WatchlistComponent,
    PortfolioComponent,
    DialogElementsExampleDialog,
    NgbdModalContent,
    NgbdModalContentForBuySell,
    NgbdModalContentForSell,
    NgbdModalContentForBuy
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FormsModule,
    HttpClientModule,
    MatInputModule,
    MatButtonModule,
    MatToolbarModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatSelectModule,
    ReactiveFormsModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    NgbModule,
    MatDialogModule,
    MatCardModule,
    RouterModule,
    HighchartsChartModule
  ],

  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
