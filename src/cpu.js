/**
 * LS-8 v2.0 emulator skeleton code
 */

const fs = require("fs");

// Instructions

const HLT  = 0b00011011; // Halt CPU
const LDI  = 0b00000100; // load register immediate
const MUL  = 0b00000101; // multiply register register
const PRN  = 0b00000110; // print
const PUSH = 0b00001010; // push register
const POP  = 0b00001011; // pop register
const RET  = 0b00010000; // return
const JMP  = 0b00010001; // jump to instruction line
const ADD  = 0b00001100; // add register to register
const CALL = 0b00001111; // call register
const ST   = 0b00001001; // store
const IRET = 0b00011010; // return from interrupt 
const PRA  = 0b00000111; // print alpha 

const IM = 5; // R5
const IS = 6; // R6

/**
 * Class for simulating a simple Computer (CPU & memory)
 */
class CPU {
  /**
   * Initialize the CPU
   */
  constructor(ram) {
    this.ram = ram;

    this.reg = new Array(8).fill(0); // General-purpose registers, arrays containing 8 indexes
    this.reg[7] = 0xf8; // this is the top of our stack

    // Special-purpose registers
    this.reg.PC = 0; // Program Counter
    this.reg.IR = 0; // Instruction Register

    // flags
    this.flags = {
        interruptsEnabled: true,
        overflow: false,
    };

    this.setupBranchTable();
  }

  /**
   * Sets up the branch table
   * similar to a phonebook or reverse phone lookup, provides a way of figuring out which function to run
   */
  setupBranchTable() {
    let bt = {};

    bt[HLT] = this.HLT;
    bt[LDI] = this.LDI;
    bt[MUL] = this.MUL;
    bt[PRN] = this.PRN;
    bt[PUSH] = this.PUSH;
    bt[POP] = this.POP;
    bt[CALL] = this.CALL;
    bt[RET] = this.RET;
    bt[JMP] = this.JMP;
    bt[ADD] = this.ADD;
    bt[ST] = this.ST;
    bt[IRET] = this.IRET;
    bt[PRA] = this.PRA;

    this.branchTable = bt;
  }

  /**
   * Store value in memory address, useful for program loading
   */
  poke(address, value) {
    this.ram.write(address, value);
  }

  /**
   * Starts the clock ticking on the CPU
   */
  startClock() {
    const _this = this;

    this.clock = setInterval(() => {
      _this.tick();
    }, 1);

    this.timerHandler = setInterval(() => {
      // trigger timer interrupt
      // set bit 0 of the IS to 1, which is the timer interrupt

      //this.reg[6] = this.reg[6] | 0b00000001;
      // this line ^^ can also be written short hand as
      this.reg[6] |= 0b00000001;
    }, 1000);
  }

  /**
   * Stops the clock
   */
  stopClock() {
    clearInterval(this.clock);
    clearInterval(this.timerHandler);
  }

  /**
   * ALU functionality
   *
   * op can be: ADD SUB MUL DIV INC DEC CMP
   */
  alu(op, regA, regB) {
    let valA = this.reg[regA];
    let valB = this.reg[regB];
    switch (op) {
      case "MUL":
        this.reg[regA] = (valA * valB) & 0b11111111;
        break;
      case "ADD":
        this.reg[regA] = (valA + valB) & 0b11111111;
        break;
    }
  }

  /**
   * Advances the CPU one cycle
   */
  tick() {
    // interrupt stuff
    // check if an interrupt happened
    const maskedInterrupts = this.reg[IS] & this.reg[IM];

    if (this.flags.interruptsEnabled && maskedInterrupts !== 0) {
      for (let i = 0; i <= 7; i++) {
        if (((maskedInterrupts >> i) & 1) === 1) {
            // handling interrupt
            this.flags.interruptsEnabled = false;

            // clear the ith bit in the IS
            this.reg[IS] &= ~(1 << i);
        
            // push PC to stack
            this.reg[7]--;
            this.ram.write(this.reg[7], this.reg.PC);

            // push remaining registers on stacl
            for (let j = 0; j <= 7; j++) {
                this.reg[7]--;
                this.ram.write(this.reg[7], this.reg[j]);
            }

            // look up the handler address in the interrupt vector table
            const vectorTableEntry = 0xf8 + i;
                                    // ^^ starting from f8, add i to find the vector
            const handlerAddress = this.ram.read(vectorTableEntry);

            // set PC to handler
            this.reg.PC = handlerAddress;

          // console.log(`handling interrupt ${i}!`);
          break;
        }
      }
    }
    // if it did, jump to that interrupt handler

    // Load the instruction register from the current PC
    this.reg.IR = this.ram.read(this.reg.PC);

    // Debugging output
    // console.log(`${this.reg.PC}: ${this.reg.IR.toString(2)}`);

    // Based on the value in the Instruction Register, jump to the
    // appropriate hander in the branchTable
    const handler = this.branchTable[this.reg.IR];

    // Check that the handler is defined, halt if not (invalid
    // instruction)
    if (!handler) {
      console.error(
        `Invalid input inscruction at address: ${
          this.reg.PC
        }, with value: ${this.reg.IR.toString(2)}`
      );
      this.stopClock();
      return;
    }

    // We need to use call() so we can set the "this" value inside
    // the handler (otherwise it will be undefined in the handler)
    handler.call(this);
  }

  // INSTRUCTION HANDLER CODE:

  /**
   * HLT
   */
  HLT() {
    this.stopClock();
  }

  /**
   * LDI R,I
   */
  LDI() {
    // !!! IMPLEMENT ME
    const regA = this.ram.read(this.reg.PC + 1);
    const val = this.ram.read(this.reg.PC + 2); // immediate value
    this.reg[regA] = val;
    this.reg.PC += 3;
  }

  /**
   * MUL R,R
   */
  MUL() {
    // !!! IMPLEMENT ME
    const regA = this.ram.read(this.reg.PC + 1);
    const regB = this.ram.read(this.reg.PC + 2);

    this.alu("MUL", regA, regB);

    this.reg.PC += 3;
  }

  /**
   * PRN R
   */
  PRN() {
    // set regA to the value contained on the next line
    const regA = this.ram.read(this.reg.PC + 1);
    console.log(this.reg[regA]);
    // move the pointer down two instructional lines
    this.reg.PC += 2;
  }
  PUSH() {
    // set regA to the value contained on the next line
    const regA = this.ram.read(this.reg.PC + 1);
    // decrement the registry pointer
    this.reg[7]--;
    // write into this reg location, the value of regA
    this.ram.write(this.reg[7], this.reg[regA]);
    // move the pointer down two instructional lines
    this.reg.PC += 2;
  }
  POP() {
    // regA is the memory location we want to store information in
    const regA = this.ram.read(this.reg.PC + 1);
    // stackVal is the data we want to work at (which is indicated by the location held in r7, which is the index value of the registry array, which points to the memory array)
    const stackVal = this.ram.read(this.reg[7]);
    // enter into the registry, the value held at the index location indicated by regA
    this.reg[regA] = stackVal;
    // increment the counter to the next memory index
    this.reg[7]++;
    // increment the program counter to the next line of instruction
    // which two lines from the current location, as pop only takes one argument
    this.reg.PC += 2;
  }
  CALL() {
    // call r3
    const regA = this.ram.read(this.reg.PC + 1);
    // push address of next instruction onto the stack
    this.reg[7]--;
    this.ram.write(this.reg[7], this.reg.PC + 2);

    // jump to the address stored in regA
    this.reg.PC = this.reg[regA];

    // don't increment the counter here, because we're telling WHERE to go
    // to increment the counter here, would skip whatever instructions follow
  }
  RET() {
    // set the program counter to the location stored in the memory index found in reg7
    this.reg.PC = this.ram.read(this.reg[7]);
    // increment the registry counter
    this.reg[7]++;
  }
  JMP() {
    // store in regA the instruction found on the next line of code
    const regA = this.ram.read(this.reg.PC + 1);
    // go to this address in regA
    this.reg.PC = this.reg[regA];
  }
  ADD() {
    const regA = this.ram.read(this.reg.PC + 1);
    const regB = this.ram.read(this.reg.PC + 2);

    this.alu("ADD", regA, regB);

    this.reg.PC += 3;
  }
  ST() {
    const regA = this.ram.read(this.reg.PC + 1);
    const regB = this.ram.read(this.reg.PC + 2);

    this.ram.write(this.reg[regA], this.reg[regB]);

    this.reg.PC += 3;
  }
  IRET() {
      
      // pop remaining registers off stack
      for (let j = 7; j >= 0; j--) {
          this.reg[j] = this.ram.read(this.reg[7]);
          this.reg[7]++;
        }
        // pop PC off stack
        this.reg.PC = this.ram.read(this.reg[7]);
        this.reg[7]++;

        // enable interrupts
        this.flags.interruptsEnabled = true;
  }
  PRA() {
    // set regA to the value contained on the next line
    const regA = this.ram.read(this.reg.PC + 1);
    console.log(String.fromCharCode(this.reg[regA]));
    // move the pointer down two instructional lines
    this.reg.PC += 2;
  }
}

module.exports = CPU;
