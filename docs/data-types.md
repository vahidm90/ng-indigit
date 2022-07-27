# Data Types

## IDigitGroupParam

The parameters for customizing digit grouping; you can set the group size and the delimiter character.

___Note:___

* _setting <code><span style="color: #9876AA;">groupSize</span></code> to __values smaller than or equal to`0` (zero)__
  will remove digit grouping._

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


