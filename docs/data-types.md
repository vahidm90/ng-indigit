# Data Types

## TPrettyFloatOption

The parameters for the decimal part and/or customizing digit grouping passed as provider to the module that imports _
NgIndigitModule_.

<pre>
{
  <span style="color: #9876AA;">digitGroups</span>?: <a href="#TPrettyFloatDigitGroupOption">TPrettyFloatDigitGroupOption</a>;
  <span style="color: #9876AA;">decimal</span>?: <a href="#TPrettyFloatDecimalOption">TPrettyFloatDecimalOption</a>;
}
</pre>

## TPrettyFloatDigitGroupOption

The parameters for customizing digit grouping; you can set the group size and the delimiter character for the digit
groups of the integer and/or the decimal part of the number.

__Accepts__
<code><span style="color: #CC7832;">boolean</span></code>,
<code>Partial<<a href="docs/data-types.md#IPrettyFloatDigitGroupOption" target="_blank">IDigitGroupParam</a>></code>, or
<code><a href="#IPrettyFloatDigitGroupOption" target="_blank">IPrettyFloatDigitGroupOption</a></code>.

___Note:___

* _passing a
  <code><span style="color: #CC7832;">boolean</span></code>
  or
  <code>Partial<<a href="docs/data-types.md#IPrettyFloatDigitGroupOption" target="_blank">IDigitGroupParam</a>></code>
  sets digit grouping parameters for both integer and decimal parts of the number; __passing parameters for each part
  individually overrides such values!___

## TPrettyFloatDecimalOption

The decimal part parameters; you can set any combination of the following parameters:

* the float point (decimal separator) character;
* maximum number of decimal digits;
* minimum number of decimal digits;
* whether decimal numbers are accepted.

__Accepts__
<code><span style="color: #CC7832;">boolean</span></code>, or
<code>Partial<<a href="#IPrettyFloatDecimalParam" target="_blank">IPrettyFloatDecimalParam</a>></code>.

## IPrettyFloatDigitGroupOption

The parameters for customizing digit grouping; you can set the group size and the delimiter character for the integer
and/or the decimal part of the number.

<pre>
{
  <span style="color: #9876AA;">integerPart</span>?: <a href="#TDigitGroupOption">TDigitGroupOption</a>;
  <span style="color: #9876AA;">decimalPart</span>?: <a href="#TDigitGroupOption">TDigitGroupOption</a>;
  <span style="color: #9876AA;">hasDigitGroups</span>?: <span style="color: #CC7832;">boolean</span>;
}
</pre>

___Note:___

* _setting <code><span style="color: #9876AA;">hasDigitGroups</span></code> to <code><span style="color: #CC7832;">
  false</span></code>
  __always disables__ digit grouping._

## TDigitGroupOption

The parameters for customizing digit grouping; you can set the group size and the delimiter character for the digit
groups.

__Accepts__
<code><span style="color: #CC7832;">boolean</span></code>, or
<code>Partial<<a href="docs/data-types.md#IPrettyFloatDigitGroupOption" target="_blank">IDigitGroupParam</a>></code>.

## IDigitGroupParam

The parameters for customizing digit grouping; you can set the group size and the delimiter character.

___Note:___

* _setting <code><span style="color: #9876AA;">groupSize</span></code> to __values smaller than or equal to`0` (zero)
  disables__
  digit grouping._

<pre>
{
  <span style="color: #9876AA;">groupSize</span>: <span style="color: #CC7832;">number</span>;
  <span style="color: #9876AA;">delimiter</span>: <a href="#TCustomCharacter">TCustomCharacter</a>;
}
</pre>

## IPrettyFloatDecimalParam

The parameters for customizing the decimal part; you can set the float point character (the character to use instead of
the default `.` character in float numbers), whether float numbers are allowed, and the maximum / minimum number of
decimal digits

<pre>
{
  <span style="color: #9876AA;">floatPoint</span>: <a href="#TCustomCharacter">TCustomCharacter</a>,
  <span style="color: #9876AA;">isDecimalAllowed</span>: <span style="color: #CC7832;">boolean</span>;
  <span style="color: #9876AA;">maxDigitCount</span>: <span style="color: #CC7832;">number</span>;
  <span style="color: #9876AA;">maxDigitCount</span>: <span style="color: #CC7832;">number</span>;
}
</pre>
___Note:___

* _setting <code><span style="color: #9876AA;">minDigitCount</span></code> to __values smaller than or equal
  to <code><span style="color: #6897BB;">0</span></code> (zero)__ removes this restriction;_
* _setting <code><span style="color: #9876AA;">maxDigitCount</span></code> to __values smaller
  than <code><span style="color: #6897BB;">0</span></code> (zero)__ removes this restriction;_
* _setting <code><span style="color: #9876AA;">maxDigitCount</span></code> to <code><span style="color: #6897BB;">
  0</span></code> __(zero)__ disables decimals._
* _setting <code><span style="color: #9876AA;">isDecimalAllowed</span></code> to <code><span style="color: #CC7832;">
  false</span></code> __always__ disables decimals._

## TCustomCharacter

Any character (a <code><span style="color: #CC7832;">string</span></code> where <code><span style="color: #9876AA;">
length</span> === <span style="color: #6897BB;">1</span></code>).


