import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { NgIndigitModule } from 'ng-indigit';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DigitGroupingOptionsComponent } from './child-components/digit-grouping-options/digit-grouping-options.component';
import { DecimalOptionsComponent } from './child-components/decimal-options/decimal-options.component';
import { TemplateDrivenComponent } from './child-components/template-driven/template-driven.component';
import { ReactiveComponent } from './child-components/reactive/reactive.component';

@NgModule({
  declarations: [
    AppComponent,
    DigitGroupingOptionsComponent,
    DecimalOptionsComponent,
    TemplateDrivenComponent,
    ReactiveComponent
  ],
  imports: [
    BrowserModule,
    NgIndigitModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
