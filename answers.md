Sprint-Challenge--Computer-Architecture
Binary, Decimal, and Hex
Complete the following problems:

Convert 11001111 binary to hex and to decimal:
  console.log(parseInt(11001111, 2).toString(16));
  console.log(parseInt(11001111, 2).toString(10));

Convert 4C hex to binary and to decimal:
  console.log(parseInt('4c', 16).toString(2));
  console.log(parseInt('4c', 16).toString(10));

Convert 68 decimal to binary and to hex:
  console.log(parseInt(68, 10).toString(2));
  console.log(parseInt(68, 10).toString(16));

Architecture
One paragraph-ish:

Explain how the CPU provides concurrency:
Concurrency: the ability to work on multiple parts of a problem without waiting for one computation to end before going onto the next (serial). Or to pause one process while another runs. In a modern computer, having multiple cores allow for parallel, concurrent processes to run. In our LS8 model, the interrupt allows the current process to be saved to the stack, while another process runs and once complete, to retreive the saved process from the stack, returning to where the original process left off.


Describe assembly language and machine language:
Machine language is the language of 1's and 0's. It is all that hardware understands, electrical current on or off. And by triggering the electrical currents in specific patterns, different outcomes are possible (language occurs);
Assembly language is a step above machine that allows humans to write machine code faster. It is a processor that compiles human shorthand out to binary.


Suggest the role that graphics cards play in machine learning:
GPU's allow you to throw a lot more processing power at computing complex data. Since they're designed around handling complex 3D rendering, throwing data at them allows them to use their considerable power to crunch numbers quickly. THis allows us to train systems faster, and see results quicker. They also allow you to run concurrent problems, as they're multi-threaded, where as the CPU is single threaded, and must work sequentially.

