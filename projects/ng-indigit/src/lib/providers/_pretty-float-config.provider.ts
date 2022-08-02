import { InjectionToken } from '@angular/core';
import { IPrettyFloatOption } from '../interfaces';

export const NG_INDIGIT_PRETTY_FLOAT_CONFIG: InjectionToken<IPrettyFloatOption>
  = new InjectionToken<IPrettyFloatOption>('DefaultPrettyFloatConfiguration');
