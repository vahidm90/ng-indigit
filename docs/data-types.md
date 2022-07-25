# Data Types

## IDigitGroupParameter

The parameters for customizing digit grouping; you can set the group size and the delimiter character.
_Note: setting `groupSize` to `0` __(zero)__ will remove digit grouping._
<pre>
{
  <span style="color: #9876AA;">groupSize</span>: <span style="color: #CC7832;">number</span>;
  <span style="color: #9876AA;">delimiter</span>: <a href="#TDigitGroupDelimiter">TDigitGroupDelimiter</a>
}
</pre>

## IDecimalPartParameter

The parameters for customizing the decimal part; you can set the float point character (the character to use instead of
the default `.` character in float numbers), and maximum/minimum number of decimal digits

<i>
Note:
<ul>
<li>setting <code>minDigitCount</code> to <b>values smaller than or equal to <code>0</code> (zero)</b> removes this restriction;</li>
<li>setting <code>maxDigitCount</code> to <b>values smaller than <code>0</code> (zero)</b> removes this restriction;</li>
<li>setting <code>maxDigitCount</code> to <b><code>0</code> (zero)</b> disables decimals;</li>
</ul>
</i>
<pre>
{
  <span style="color: #9876AA;">point</span>: <a href="#TCustomFloatPoint">TCustomFloatPoint</a>,
  <span style="color: #9876AA;">minDigitCount</span>: <span style="color: #CC7832;">number</span>;
  <span style="color: #9876AA;">maxDigitCount</span>: <span style="color: #CC7832;">number</span>;
}
</pre>

## TDigitGroupDelimiter

The custom character for separating digit groups;
__Supports__: `,`, ` ` (white space), `-`, <code>`</code>

## TCustomFloatPoint

The custom character to use instead of the default float point character;
__Supports__: `/`, `,`.

