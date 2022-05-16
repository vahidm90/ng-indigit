import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NgIndigitModule } from 'ng-indigit';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    NgIndigitModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
