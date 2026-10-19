/* MathQuest curriculum: 30 modules x 30 questions (3 topic blocks of 10), lessons, builder */
(function (g) {
  'use strict';
  const M = g.MQ;

  const TOPICS = {
    wordmulti: ['Word problems', '🧩'], multi: ['Multiplying', '✖️'], division: ['Dividing', '➗'], place: ['Place value', '🔢'], decimals: ['Decimals', '🔟'],
    fracpic: ['Fractions in pictures', '🍕'], fracop: ['Fractions', '🥧'], fdp: ['Fractions, decimals & %', '💯'], pattern: ['Patterns', '🔁'], money: ['Money', '💰'],
    ratio: ['Ratio & rates', '⚖️'], algebra: ['Algebra', '🕵️'], bodmas: ['Order of operations', '🎯'], factors: ['Factors & multiples', '🧱'], neg: ['Negative numbers', '🌡️'],
    roots: ['Squares & roots', '🟦'], indices: ['Powers & index laws', '🚀'], measure: ['Measurement', '📏'], clock: ['Time', '⏰'], geometry: ['Shapes & angles', '📐'],
    pythag: ['Pythagoras', '🔺'], coords: ['Coordinates', '🗺️'], stats: ['Data & statistics', '📊'], prob: ['Chance & probability', '🎲'], area: ['Area & perimeter', '🟩'],
    volume: ['Volume & capacity', '🧊'], missing: ['Missing numbers', '❓']
  };

  /* base difficulty level per module (2 ≈ Year 2 … 5 ≈ Year 5 … 8 ≈ Year 8) */
  const LEVELS = [2.3, 2.6, 2.9, 3.2, 3.5, 3.8, 4.0, 4.2, 4.4, 4.6, 4.8, 5.0, 5.1, 5.3, 5.5, 5.7, 5.9, 6.0, 6.1, 6.2, 6.3, 6.5, 6.7, 7.0, 7.2, 7.4, 7.6, 7.8, 8.1, 8.5];

  const PLAN = [
    ['Number Safari', ['wordmulti', 'place', 'geometry']],
    ['Treasure Arrays', ['multi', 'measure', 'fracpic']],
    ['Sharing Island', ['division', 'clock', 'stats']],
    ['Market Day', ['wordmulti', 'money', 'area']],
    ['Pattern Jungle', ['multi', 'fracpic', 'pattern']],
    ['Lucky Dip Lagoon', ['division', 'geometry', 'prob']],
    ['Slice & Share Café', ['wordmulti', 'fracop', 'volume']],
    ['Place Value Peaks', ['place', 'decimals', 'area']],
    ['Square Number Castle', ['multi', 'stats', 'roots']],
    ['Short Division Station', ['division', 'fracop', 'clock']],
    ['Decimal Docks', ['wordmulti', 'decimals', 'geometry']],
    ['Fraction Forest', ['fracop', 'factors', 'prob']],
    ['Big Multiplication Mountain', ['multi', 'area', 'fdp']],
    ['Graph Galaxy', ['stats', 'volume', 'pattern']],
    ['Roots & Order Ruins', ['roots', 'bodmas', 'decimals']],
    ['Mixed-Up Fractions', ['division', 'fracop', 'coords']],
    ['Power Up!', ['wordmulti', 'indices', 'measure']],
    ['Percent Planet', ['fdp', 'geometry', 'ratio']],
    ['Below Zero', ['area', 'factors', 'neg']],
    ['Cube City', ['volume', 'stats', 'fracop']],
    ['Root Canyon', ['roots', 'prob', 'decimals']],
    ['Index Law Academy', ['indices', 'bodmas', 'wordmulti']],
    ['Ratio Rapids', ['ratio', 'area', 'algebra']],
    ['Angle Arena', ['fracop', 'geometry', 'neg']],
    ['Equation Express', ['indices', 'algebra', 'stats']],
    ['Prism Palace', ['volume', 'fdp', 'roots']],
    ['Chance & Circles', ['prob', 'area', 'ratio']],
    ['Index Detectives', ['indices', 'factors', 'missing']],
    ['Pythagoras Pyramid', ['pythag', 'bodmas', 'neg']],
    ['Boss Level: The Final Challenge!', ['pythag', 'volume', 'algebra']]
  ];

  /* ---------- Lessons: arrays of [maxLevel, html] ---------- */
  const ex = h => `<div class="ex"><b>Try it:</b> ${h}</div>`;
  const LESSONS = {
    wordmulti: [
      [3.5, `<p>Word problems are <b>stories with a maths question hiding inside</b>. Be a detective:</p><ol><li><b>Read</b> it twice. What is the question really asking?</li><li><b>Underline</b> the numbers.</li><li>Decide the <b>steps</b>. "Altogether" usually means add, "left" means take away, "each" or "groups of" means multiply or share.</li></ol>${ex('Mia has 12 stickers and gets 5 more, then gives 4 away. 12 + 5 = 17, then 17 − 4 = <b>13</b>.')}`],
      [6.5, `<p>Multi-step problems need a <b>plan</b> before you calculate. Write the steps in order: <i>Step 1 → Step 2 → answer</i>.</p><ul><li>"<b>How many are needed</b>" and you have a leftover? Round <b>up</b> (you cannot buy 2.3 buses).</li><li>"A fraction of what is LEFT" means the second fraction uses the new, smaller amount.</li><li>Find the <b>unit rate</b> (the price of one) when the question changes the number of items.</li></ul>${ex('A tin of paint covers 12 m². The wall is 6 m × 5 m = 30 m². 30 ÷ 12 = 2.5 → you need <b>3 tins</b>.')}`],
      [9, `<p>Hard problems often hide a <b>percentage, ratio, or rate</b>. Write what you know, name the unknown, and work step by step. Each % change applies to the amount you have <i>at that moment</i>.</p>${ex('Population 800, +20% = 800 × 1.2 = 960. Then −10%: 960 × 0.9 = <b>864</b> (not 800 × 1.1!).')}`]
    ],
    multi: [
      [3.5, `<p>Multiplication is <b>repeated addition</b>: 4 × 5 means 4 groups of 5. An <b>array</b> shows rows and columns of dots.</p>${ex('3 rows of 5 dots: 5 + 5 + 5 = 15, so 3 × 5 = <b>15</b>.')}<p>Skip-count by the table number to check!</p>`],
      [5.5, `<p>For bigger numbers, <b>split</b> one number into tens and ones (the <i>area model</i>):</p>${ex('24 × 13 = 24 × 10 + 24 × 3 = 240 + 72 = <b>312</b>')}<p>Or use the written method: multiply by the ones, then by the tens (put a 0 as a placeholder), then add.</p>`],
      [9, `<p>To multiply by <b>10, 100, 1000</b> the digits slide left. For decimals, ignore the point, multiply, then put the point back so the answer has <b>the same total number of decimal places</b> as the question.</p>${ex('0.3 × 0.4: 3 × 4 = 12; two decimal places in total → <b>0.12</b>.')}`]
    ],
    division: [
      [3.5, `<p>Division is <b>sharing equally</b> or <b>making groups</b>. 12 ÷ 3: share 12 into 3 equal groups, or ask "how many 3s fit into 12?" (4). Division is the opposite of multiplying: 4 × 3 = 12.</p><p>A <b>remainder</b> is what is left over when things do not share equally.</p>`],
      [5.5, `<p><b>Short division (the bus-stop method)</b> works from the left. Divide, write the answer on top, and carry the remainder to the next digit.</p>${ex('Short division: 756 ÷ 6. 7 ÷ 6 = 1 r 1 → carry 1 → 15 ÷ 6 = 2 r 3 → 36 ÷ 6 = 6. Answer <b>126</b>.')}<p>Check by multiplying back: 126 × 6 = 756 ✔</p>`],
      [9, `<p>Keep dividing into <b>decimals</b>: when you run out of digits, add a decimal point and zeros and carry on. Dividing by a decimal? Multiply both numbers by 10 (or 100) to make the divisor whole first.</p>${ex('7 ÷ 4: 7.00 ÷ 4 = <b>1.75</b>. And 3 ÷ 0.5 = 30 ÷ 5 = <b>6</b>.')}`]
    ],
    place: [
      [3.5, `<p>Every digit has a <b>place</b> and a <b>value</b>. In 347: the 3 is in the hundreds place (value 300), the 4 is tens (40), the 7 is ones (7).</p><p><b>Rounding</b>: look at the digit to the right. 5 or more → round up, 4 or less → stay.</p>`],
      [6.5, `<p>Places go on: ones, tens, hundreds, thousands, ten thousands, hundred thousands, millions. After the decimal point: <b>tenths, hundredths, thousandths</b>.</p>${ex('In 4.372 the 7 is in the hundredths place, so its value is 7/100 = <b>0.07</b>.')}<p>To round to 1 decimal place, look at the 2nd decimal digit.</p>`],
      [9, `<p><b>Significant figures</b> start counting at the first digit that is not zero. 0.004567 to 2 significant figures: the first two non-zero digits are 4 and 5; the next digit (6) rounds up → <b>0.0046</b>.</p>`]
    ],
    decimals: [
      [4.5, `<p>Decimals are fractions of ten: 0.1 = one tenth. Money is decimals: $3.50 is 3 dollars and 50 hundredths. <b>Line up the decimal points</b> when you add or subtract and fill empty spaces with zeros.</p>${ex('3.5 + 2.75 → 3.50 + 2.75 = <b>6.25</b>')}`],
      [6.5, `<p>Multiplying by 10 moves digits one place left (the point seems to move right); dividing by 10 moves them right. On a number line each tiny step is a tenth or a hundredth - find the two numbers either side first.</p>`],
      [9, `<p>To multiply decimals: ignore the points, multiply the whole numbers, then count the total decimal places in the question and give your answer the same. To divide by a decimal, scale both numbers up so the divisor is a whole number.</p>`]
    ],
    fracpic: [
      [3.5, `<p>A fraction names <b>equal parts of a whole</b>. The <b>bottom</b> number (denominator) says how many equal parts in total. The <b>top</b> number (numerator) says how many are shaded.</p>${ex('A bar split in 4 with 3 shaded is <b>3/4</b>.')}`],
      [9, `<p>Equivalent fractions name the same amount: multiply or divide top and bottom by the <b>same number</b>. To simplify, divide both by a common factor. A percentage is a fraction out of 100.</p>${ex('6/15: divide both by 3 → <b>2/5</b> = 40%.')}`]
    ],
    fracop: [
      [4.5, `<p><b>A fraction of an amount</b>: divide by the bottom number, then multiply by the top. 3/4 of 24: 24 ÷ 4 = 6, 6 × 3 = <b>18</b>.</p><p>When the bottom numbers are the same you just add the tops: 2/8 + 3/8 = 5/8.</p>`],
      [6.5, `<p>To add or subtract with different bottoms, find a <b>common bottom number</b> first (equivalent fractions).</p>${ex('1/2 + 1/3 = 3/6 + 2/6 = <b>5/6</b>')}<p>Improper fractions (top bigger than bottom) can be written as mixed numbers: 7/4 = 1 3/4.</p>`],
      [9, `<p><b>Multiply</b> fractions: tops × tops, bottoms × bottoms, then simplify. <b>Divide</b> by a fraction: <i>keep, change, flip</i> - multiply by the upside-down fraction.</p>${ex('2/3 ÷ 4/5 = 2/3 × 5/4 = 10/12 = <b>5/6</b>')}`]
    ],
    fdp: [
      [5.5, `<p><b>Fractions, decimals and percentages</b> are three ways to write the same amount. 1/4 = 0.25 = 25%. Percent means <b>out of 100</b>.</p><p>Quick percentages: 50% = ÷ 2, 25% = ÷ 4, 10% = ÷ 10.</p>`],
      [7.5, `<p>Build any percentage from 10%: 15% = 10% + 5% (half of 10%). To find a <b>percentage change</b>, work out the change ÷ original × 100.</p>${ex('A $80 jacket 25% off: 25% of 80 = 20, so it costs <b>$60</b>.')}`],
      [9, `<p><b>Reverse percentages</b>: if the price after a 20% discount is $64, then 64 is <b>80%</b> of the original. 1% = 0.8, so 100% = <b>$80</b>.</p>`]
    ],
    pattern: [
      [3.5, `<p>A pattern follows a <b>rule</b>. Look at the jump from one number to the next. If it is always +5, count on in fives to find missing numbers.</p>`],
      [5.5, `<p>Some patterns multiply or use <b>two-step rules</b> (×2 then +1). Test your rule on every pair of numbers in the pattern.</p>`],
      [9, `<p>For a number pattern with a constant jump, the <b>nth term</b> is <b>jump × n + (something)</b>. 5, 8, 11, 14… jumps by 3: 3n + 2. The 20th term is 3 × 20 + 2 = <b>62</b>.</p>`]
    ],
    money: [
      [4.5, `<p>Work with cents or dollars, not both at once. To find <b>change</b>, count up from the price to the money paid, or subtract. Total first, change second.</p>`],
      [9, `<p><b>Best buy</b>: compare the price of ONE item (unit price) in each deal. The smaller unit price is the better value.</p>${ex('5 for $4.50 → $0.90 each. 8 for $6.80 → $0.85 each. The second is cheaper per item.')}`]
    ],
    ratio: [
      [6.5, `<p>A <b>ratio</b> compares amounts. Red:blue = 2:3 means for every 2 red there are 3 blue. To share an amount: add the parts, find the value of <b>one part</b>, then multiply.</p>${ex('$50 shared 2:3. 2 + 3 = 5 parts. 50 ÷ 5 = 10 per part. Shares: $20 and <b>$30</b>.')}`],
      [9, `<p>Simplify ratios by dividing every number by the same factor (like fractions). A <b>rate</b> compares different units: speed = distance ÷ time. A map scale of 1:50 000 means 1 cm on the map is 50 000 cm = 0.5 km in real life.</p>`]
    ],
    algebra: [
      [6, `<p>A letter stands for a <b>mystery number</b>. 3n means 3 × n. In a <b>number machine</b>, work forwards from the input; to find an unknown input, run the machine <b>backwards</b> using the opposite operations.</p>`],
      [7.5, `<p><b>Solve</b> an equation by doing the same to both sides, undoing operations in reverse order. 3x + 4 = 19 → take 4 → 3x = 15 → ÷ 3 → x = 5. Always check by substituting back.</p><p>Like terms: 3a + 5a = 8a.</p>`],
      [9, `<p>With letters on both sides, collect the x terms on one side and numbers on the other. 5x − 7 = 2x + 11 → 3x = 18 → <b>x = 6</b>. To expand a bracket, multiply <b>everything</b> inside: 3(x + 2) = 3x + 6.</p>`]
    ],
    bodmas: [
      [5.5, `<p>Maths has a <b>rule order</b>: <b>B</b>rackets, <b>O</b>rders (powers & roots), <b>D</b>ivision and <b>M</b>ultiplication (left to right), <b>A</b>ddition and <b>S</b>ubtraction (left to right).</p>${ex('3 + 4 × 2 = 3 + 8 = <b>11</b> (not 14!)')}`],
      [9, `<p>Powers and roots are done <b>before</b> × and ÷, but after brackets. Do the inside of brackets first, then powers, then × ÷, then + −.</p>${ex('2 + 3² × 2 = 2 + 9 × 2 = 2 + 18 = <b>20</b>')}`]
    ],
    factors: [
      [4.5, `<p><b>Multiples</b> are in the times table (6, 12, 18…). <b>Factors</b> divide exactly into a number (factors of 12: 1, 2, 3, 4, 6, 12). Find them in <b>pairs</b>: 1×12, 2×6, 3×4.</p>`],
      [6.5, `<p>A <b>prime</b> has exactly two factors (1 and itself): 2, 3, 5, 7, 11… <b>HCF</b> = biggest factor shared by two numbers. <b>LCM</b> = smallest multiple shared by two numbers.</p>${ex('HCF(12, 18) = 6. LCM(4, 6) = 12.')}`],
      [9, `<p>Break a number into <b>prime factors</b> using a factor tree: 72 = 2 × 2 × 2 × 3 × 3 = 2³ × 3². HCF/LCM word problems: "as many equal groups as possible" → HCF, "will happen together again" → LCM.</p>`]
    ],
    neg: [
      [5.5, `<p><b>Negative numbers</b> are less than zero, like temperatures below freezing. On a number line, <b>up/right = bigger</b>, <b>down/left = smaller</b>. −7 is colder than −2.</p>${ex('−3°C and it warms by 8: move 8 up → <b>5°C</b>.')}`],
      [9, `<p>Rules for integers: <b>subtracting a negative</b> is the same as adding (−5 − (−3) = −5 + 3 = −2). <b>Negative × negative = positive</b>, positive × negative = negative. Same rules for dividing. An even power of a negative is positive: (−2)² = 4, (−2)³ = −8.</p>`]
    ],
    roots: [
      [4.5, `<p>A <b>square number</b> is a number multiplied by itself: 4 × 4 = 16, written 4². Draw it as a square array of dots!</p>`],
      [6.5, `<p>The <b>square root</b> undoes squaring: √49 = 7 because 7 × 7 = 49. A <b>cube</b> is n × n × n (3³ = 27) and the <b>cube root</b> undoes it. A square with area 81 cm² has sides of √81 = 9 cm.</p><p>To estimate a root, find the squares either side: √40 is between 6 (36) and 7 (49).</p>`],
      [9, `<p>Roots of decimals: √0.49 = 0.7 because 0.7 × 0.7 = 0.49. You can split roots over multiplication: √(9 × 16) = √9 × √16 = 3 × 4 = 12. For a non-perfect square, find the two perfect squares either side and decide which is closer.</p>`]
    ],
    indices: [
      [5.5, `<p>A <b>power</b> (index) is a short way to write repeated multiplication. 2⁴ = 2 × 2 × 2 × 2 = 16. The big number is the <b>base</b>, the small raised number is the <b>exponent</b> (how many times).</p><p>10² = 100, 10³ = 1000 - the exponent is the number of zeros.</p>`],
      [7.5, `<p><b>Index laws</b> (same base):</p><ul><li>Multiply: <b>add</b> the powers. a³ × a⁴ = a⁷</li><li>Divide: <b>subtract</b> the powers. a⁷ ÷ a³ = a⁴</li><li>Power of a power: <b>multiply</b> the powers. (a²)³ = a⁶</li><li>Anything⁰ = 1, and a¹ = a</li></ul>${ex('2³ × 2⁴ = 2⁷ = 128')}<p>Why? 2³ × 2⁴ = (2×2×2) × (2×2×2×2) = seven 2s.</p>`],
      [9, `<p>Combine the laws one step at a time. 3⁵ × 3² ÷ 3⁴ = 3⁵⁺²⁻⁴ = 3³ = 27. <b>Negative powers</b> mean 1 over: 10⁻² = 1/100 = 0.01. <b>Scientific notation</b>: 4.5 × 10³ = 4500 (move the point 3 places right).</p>`]
    ],
    measure: [
      [3.5, `<p>We measure length in <b>cm and m</b>, mass in <b>g and kg</b>, capacity in <b>mL and L</b>. Line the object up at <b>0</b> on a ruler and read where it ends.</p>`],
      [6.5, `<p>Remember: 1 m = 100 cm, 1 km = 1000 m, 1 kg = 1000 g, 1 L = 1000 mL. Going to a <b>smaller</b> unit → multiply (more of them). Going to a <b>bigger</b> unit → divide.</p>`],
      [9, `<p>Area and volume units scale faster: 1 m = 100 cm, so 1 m² = 100 × 100 = 10 000 cm². 1 m³ = 1000 L. Speed: km/h ÷ 3.6 = m/s.</p>`]
    ],
    clock: [
      [3.5, `<p>The <b>short hand</b> shows the hour, the <b>long hand</b> shows minutes. When the long hand is on 6 it is "half past"; on 3 it is "quarter past"; on 9 "quarter to".</p>`],
      [9, `<p>The long hand moves 5 minutes for each number: 1 = 5 min, 2 = 10 min… To work out <b>elapsed time</b>, count up to the next hour, then add the rest. Add whole hours first, then minutes (carry 60 minutes into an hour). For pm times in 24-hour clock, subtract 12.</p>`]
    ],
    geometry: [
      [3.5, `<p>Learn shape names by their number of sides: triangle (3), quadrilateral (4), pentagon (5), hexagon (6), octagon (8). 3D shapes have <b>faces</b> (flat sides), <b>edges</b> (where faces meet) and <b>vertices</b> (corners).</p>`],
      [5.5, `<p>Angles: <b>acute</b> &lt; 90°, <b>right</b> = 90°, <b>obtuse</b> between 90° and 180°, <b>straight</b> = 180°. Angles on a straight line add to 180°; angles around a point add to 360°; vertically opposite angles are equal.</p>`],
      [6.5, `<p>Angles in a <b>triangle</b> add to 180°; in a <b>quadrilateral</b>, 360°. In an isosceles triangle two angles are equal.</p>${ex('Two angles 50° and 60°: third = 180 − 50 − 60 = <b>70°</b>')}`],
      [9, `<p>With <b>parallel lines</b>: corresponding (F) and alternate (Z) angles are <b>equal</b>; co-interior (C) angles add to <b>180°</b>. The angle sum of a polygon with n sides is (n − 2) × 180°. Exterior angles of any polygon add to 360°.</p>`]
    ],
    pythag: [
      [9, `<p><b>Pythagoras' theorem</b>: in a right-angled triangle, a² + b² = c², where c is the <b>hypotenuse</b> (the longest side, opposite the right angle).</p>${ex('Legs 3 and 4: 9 + 16 = 25, so c = √25 = <b>5</b>. To find a short side, subtract: a² = c² − b².')}<p>Famous triples: (3,4,5), (5,12,13), (8,15,17).</p>`]
    ],
    coords: [
      [5.5, `<p>Coordinates (x, y) locate a point. Go <b>across first</b> (x), then <b>up</b> (y): "along the corridor, up the stairs".</p>`],
      [9, `<p>The grid has four quadrants. Left of 0 → negative x; below 0 → negative y. <b>Reflecting</b> in the y-axis flips the sign of x; in the x-axis flips the sign of y. The <b>midpoint</b> is the average of the x's and the average of the y's.</p>`]
    ],
    stats: [
      [3.5, `<p>Data can be shown in <b>tally charts</b> (count in groups of 5), <b>picture graphs</b> and <b>bar charts</b>. Always check the <b>scale</b> on the side of a chart before you read it.</p>`],
      [6.5, `<p><b>Mean</b> = total ÷ how many (the "fair share" average). <b>Median</b> = middle value when ordered. <b>Mode</b> = most common. <b>Range</b> = biggest − smallest.</p>${ex('3, 5, 5, 8, 9: mean = 30 ÷ 5 = 6, median = 5, mode = 5, range = 6.')}`],
      [9, `<p>With an even number of values the median is the mean of the two middle ones. From a frequency table, multiply each value by its frequency to get the total. An <b>outlier</b> (very different value) drags the mean but barely moves the median.</p>`]
    ],
    prob: [
      [3.5, `<p>Chance words: <b>impossible, unlikely, equally likely, likely, certain</b>. Think about how many outcomes are "good" compared to how many there are in total.</p>`],
      [6.5, `<p><b>Probability = favourable outcomes ÷ total outcomes</b>, from 0 (impossible) to 1 (certain).</p>${ex('A die: chance of an even number = 3/6 = <b>1/2</b>.')}<p>The chance something does <b>not</b> happen = 1 − chance it does.</p>`],
      [9, `<p>For two independent events multiply the chances: P(heads and a 6) = 1/2 × 1/6 = 1/12. <b>Without replacement</b>, the second chance changes: 3 red and 2 blue marbles, both red = 3/5 × 2/4 = 3/10. Expected number = chance × trials.</p>`]
    ],
    area: [
      [3.5, `<p><b>Area</b> is the space inside a shape, counted in <b>square units</b>. <b>Perimeter</b> is the distance <i>around</i> the edge. Rectangle: area = length × width.</p>`],
      [6.5, `<p>Split <b>composite shapes</b> into rectangles, then add the areas. Triangle: area = ½ × base × <b>perpendicular</b> height. Parallelogram: base × height.</p>`],
      [9, `<p>Trapezium: ½ × (a + b) × h. Circle: area = π × r² (square the radius first!), circumference = π × d. Use π = 3.14. For a path around a garden, find the outer area minus the inner area.</p>`]
    ],
    volume: [
      [4.5, `<p><b>Volume</b> is the space inside a 3D shape. Count the cubes in one <b>layer</b>, then multiply by the number of layers. Volume of a box = length × width × height.</p>`],
      [6.5, `<p>1 cm³ holds 1 mL, so <b>1000 cm³ = 1 L</b>. For two boxes joined, find each volume and add.</p>`],
      [9, `<p>Prism volume = <b>area of the base (cross-section) × length</b>. Cylinder: π × r² × h. Surface area of a box = the total area of all 6 faces = 2(lw + lh + wh).</p>`]
    ],
    missing: [
      [9, `<p>Missing-number puzzles work like a balance: whatever you do to one side you do to the other. Use <b>inverse operations</b>: square ↔ root, power ↔ index laws, + ↔ −, × ↔ ÷.</p>`]
    ]
  };

  function lessonFor(topic, L) { const arr = LESSONS[topic] || [[9, '']]; for (const e of arr) if (L <= e[0]) return e[1]; return arr[arr.length - 1][1]; }

  /* ---------- Module builder ---------- */
  function buildModule(idx) {   // idx 0..29
    const plan = PLAN[idx], base = LEVELS[idx], qs = []; const seen = new Set(); const blocks = [];
    plan[1].forEach((topic, b) => {
      const blockQs = [];
      for (let i = 0; i < 10; i++) {
        const L = base - 0.3 + 0.7 * i / 9; let q = null;
        for (let attempt = 0; attempt < 12; attempt++) {
          const rng = new M.RNG((idx + 1) * 1000003 + b * 7919 + i * 131 + attempt * 104729 + 17);
          const cand = M.G[topic](rng, L); const key = M.strip(cand.prompt) + (cand.svg ? '#' + cand.svg.length : '');
          if (!seen.has(key)) { q = cand; seen.add(key); break; }
          if (attempt === 11) q = cand;
        }
        q.topic = topic; q.n = qs.length; q.id = `m${idx + 1}q${qs.length + 1}`; q.L = rd2(L);
        if (!q.desc) q.desc = M.strip(q.prompt);
        qs.push(q); blockQs.push(q);
      }
      blocks.push({ topic, name: TOPICS[topic][0], emoji: TOPICS[topic][1], lesson: lessonFor(topic, base + 0.2), qs: blockQs });
    });
    return { index: idx, title: plan[0], level: base, blocks, questions: qs };
  }
  const rd2 = x => Math.round(x * 100) / 100;
  const yearOf = L => L < 2.5 ? 'Year 2' : L < 3.5 ? 'Year 3' : L < 4.5 ? 'Year 4' : L < 5.5 ? 'Year 5' : L < 6.7 ? 'Year 6' : L < 7.5 ? 'Year 7' : 'Year 8';

  g.MQ.Course = { TOPICS, LEVELS, PLAN, LESSONS, buildModule, lessonFor, yearOf, count: PLAN.length };
})(typeof window !== 'undefined' ? window : globalThis);
