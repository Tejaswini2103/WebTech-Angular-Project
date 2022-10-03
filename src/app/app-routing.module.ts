import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './search/search.component';
import { WatchlistComponent } from './watchlist/watchlist.component';
import { StockListComponent } from './StockDetails/stock-details.component';
import { PortfolioComponent } from './portfolio/portfolio.component';



const routes: Routes = [
  { path: '' , component: SearchComponent,
children: [
  { path: 'details/:ticker', component: StockListComponent},
]
},
  { path: 'watchlist', component: WatchlistComponent},
  { path: 'portfolio', component: PortfolioComponent},
 // { path: 'search/home', component: SearchComponent},

];

@NgModule({
  imports: [ RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule { }



