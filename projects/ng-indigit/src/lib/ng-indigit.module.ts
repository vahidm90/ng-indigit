import { NgModule } from '@angular/core';
import { IndigitDirective } from './indigit.directive';


@NgModule({
  declarations: [IndigitDirective],
  exports: [IndigitDirective]
})
export class NgIndigitModule {}
