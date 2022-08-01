import { NgModule } from '@angular/core';
import { IndigitDirective } from './indigit.directive';
import { NG_INDIGIT_PRETTY_FLOAT_CONFIG } from './providers';
import { DEFAULT_DECIMAL_CONFIG, DEFAULT_DIGIT_GROUP_CONFIG } from './helpers';


@NgModule({
  declarations: [IndigitDirective],
  exports: [IndigitDirective],
  providers: [{
    provide: NG_INDIGIT_PRETTY_FLOAT_CONFIG,
    useValue: {
      digitGroups: {
        integerPart: DEFAULT_DIGIT_GROUP_CONFIG,
        decimalPart: DEFAULT_DIGIT_GROUP_CONFIG,
        hasDigitGroups: false
      },
      decimal: DEFAULT_DECIMAL_CONFIG
    }
  }]
})
export class NgIndigitModule {
}
