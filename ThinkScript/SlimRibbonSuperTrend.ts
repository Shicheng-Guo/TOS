#################################################################################
# SlimRibbonSuperTrend                                                          
# SlimRibbon study with SuperTrend ATR                                          
# Author: Eddielee394                                                           
# Version: 0.2                                                                  
# inspired by: SlimRibbon by Slim Miller and further customized by Markos       
#################################################################################

SetChartType(ChartType.CANDLE_TREND);

input price = close;

input superfast_length = 8;

input fast_length = 13;

input slow_length = 21;

input displace = 0;

input atrMult = 1.2;
#hint atrMult: increases the sensitivity of the ATR line

input nATR = 3;
#hint nATR:

input avgType = AverageType.HULL;
#hint avgType: sets the average type used to calculate the SuperTrendATR

input enableAlerts = no;
#hint enableAlerts: disables all alerts

input hideMovingAverages = yes;
#hint hideMovingAverages: hides all the moving average lines from the slimRibbon

input hideSuperTrendAtr = no;
#hint hideSuperTrendAtr: hides the SuperTrend ATR line

input tradesize = 1;

def ATR = MovingAverage(avgType, TrueRange(high, close, low), nATR);

def UP = HL2 + (atrMult * ATR);

def DN = HL2 + (-atrMult * ATR);

def ST = if close < ST[1] then UP else DN;

plot SuperTrend = ST;
SuperTrend.AssignValueColor(if close < ST then Color.RED else Color.GREEN);
SuperTrend.SetHiding(hideSuperTrendAtr);

def SuperTrendUP = if ST crosses below close[-1] then 1 else 0;
def isSuperTrendUP = SuperTrend > close;
def SuperTrendDN = if ST crosses above close[-1] then 1 else 0;
def isSuperTrendDN = SuperTrend < close;

#moving averages
def mov_avg8 = ExpAverage(price[-displace], superfast_length);

def mov_avg13 = ExpAverage(price[-displace], fast_length);

def mov_avg21 = ExpAverage(price[-displace], slow_length);

plot Superfast = mov_avg8;
Superfast.SetHiding(hideMovingAverages);

plot Fast = mov_avg13;
Fast.SetHiding(hideMovingAverages);

plot Slow = mov_avg21;
Slow.SetHiding(hideMovingAverages);


def buy = mov_avg8 > mov_avg13 and mov_avg13 > mov_avg21 and low > mov_avg8;

def stopbuy = mov_avg8 <= mov_avg13;

def buynow = !buy[1] and buy;

def buysignal = CompoundValue(1, if buynow and !stopbuy then 1 else if buysignal[1] == 1 and stopbuy then 0 else buysignal[1], 0);

plot Buy_Signal = buysignal[1] == 0 and buysignal == 1;

Buy_Signal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);

Buy_Signal.SetDefaultColor(Color.GREEN);

Buy_Signal.HideTitle();

plot Momentum_Down = buysignal[1] == 1 and buysignal == 0;

Momentum_Down.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);

Momentum_Down.SetDefaultColor(Color.YELLOW);

Momentum_Down.HideTitle();

def sell = mov_avg8 < mov_avg13 and mov_avg13 < mov_avg21 and high < mov_avg8;

def stopsell = mov_avg8 >= mov_avg13;

def sellnow = !sell[1] and sell;

def sellsignal = CompoundValue(1, if sellnow and !stopsell then 1 else if sellsignal[1] == 1 and stopsell then 0 else sellsignal[1], 0);


plot Sell_Signal = sellsignal[1] == 0 and sellsignal;

Sell_Signal.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_DOWN);

Sell_Signal.SetDefaultColor(Color.RED);

Sell_Signal.HideTitle();

plot Momentum_Up = sellsignal[1] == 1 and sellsignal == 0;

Momentum_Up.SetPaintingStrategy(PaintingStrategy.BOOLEAN_ARROW_UP);

Momentum_Up.SetDefaultColor(Color.YELLOW);

Momentum_Up.HideTitle();

plot Colorbars = if buysignal == 1 then 1 else if sellsignal == 1 then 2 else if buysignal == 0 or sellsignal == 0 then 3 else 0;

Colorbars.Hide();

Colorbars.DefineColor("Buy_Signal_Bars", Color.GREEN);

Colorbars.DefineColor("Sell_Signal_Bars", Color.RED);

Colorbars.DefineColor("Neutral", Color.YELLOW);

AssignPriceColor(if Colorbars == 1 then Colorbars.Color("buy_signal_bars") else if Colorbars == 2 then Colorbars.Color("Sell_Signal_bars") else  Colorbars.Color("neutral"));

#Orders
def sellTrigger = if SuperTrendDN or Sell_Signal then 1 else 0;
def buyTrigger = Buy_Signal;

AddOrder(OrderType.BUY_TO_OPEN, condition = buyTrigger, price = close, tradeSize = tradesize, tickcolor = Color.CYAN, arrowcolor = Color.CYAN, name = "Buy");

AddOrder(OrderType.SELL_TO_CLOSE, condition = sellTrigger, price = close[-1], tradeSize = tradesize, tickcolor = Color.PINK, arrowcolor = Color.DARK_RED, name = "Sell");


#Alerts

Alert(condition = enableAlerts and buysignal[1] == 0 and buysignal == 1, text = "Buy Signal", sound = Sound.Bell, "alert type" = Alert.BAR);

Alert(condition = enableAlerts and buysignal[1] == 1 and buysignal == 0, text = "Momentum_Down", sound = Sound.Bell, "alert type" = Alert.BAR);

Alert(condition = enableAlerts and sellsignal[1] == 0 and sellsignal == 1, text = "Sell Signal", sound = Sound.Bell, "alert type" = Alert.BAR);

Alert(condition = enableAlerts and sellsignal[1] == 1 and sellsignal == 0, text = "Momentum_Up", sound = Sound.Bell, "alert type" = Alert.BAR);

#end strategy
