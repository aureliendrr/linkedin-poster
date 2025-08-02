import { LoggerOptions } from '../types/index.js';

interface Stats {
  totalTokens: number;
  model: string;
  estimatedCost: number;
}

export class Logger {
  private verbose: boolean;
  private silent: boolean;

  constructor(options: LoggerOptions = {}) {
    this.verbose = options.verbose || false;
    this.silent = options.silent || false;
  }

  info(message: string): void {
    if (!this.silent) {
      console.log(`ℹ️  ${message}`);
    }
  }

  success(message: string): void {
    if (!this.silent) {
      console.log(`✅ ${message}`);
    }
  }

  warning(message: string): void {
    if (!this.silent) {
      console.log(`⚠️  ${message}`);
    }
  }

  error(message: string): void {
    if (!this.silent) {
      console.error(`❌ ${message}`);
    }
  }

  debug(message: string): void {
    if (this.verbose && !this.silent) {
      console.log(`🐛 ${message}`);
    }
  }

  section(title: string): void {
    if (!this.silent) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`📋 ${title}`);
      console.log(`${'='.repeat(50)}\n`);
    }
  }

  postPreview(content: string): void {
    if (!this.silent) {
      console.log('\n📣 Post LinkedIn généré :\n');
      console.log(content);
      console.log('\n' + '='.repeat(50) + '\n');
    }
  }

  stats(stats: Stats): void {
    if (!this.silent) {
      console.log('\n📊 Stats :');
      console.log(`- Tokens utilisés : ${stats.totalTokens}`);
      console.log(`- Modèle utilisé : ${stats.model}`);
      console.log(`- Coût estimé : ~$${stats.estimatedCost.toFixed(4)} USD`);
    }
  }

  progress(step: number, total: number, message: string): void {
    if (!this.silent) {
      console.log(`[${step}/${total}] ${message}`);
    }
  }

  setVerbose(verbose: boolean): void {
    this.verbose = verbose;
  }

  setSilent(silent: boolean): void {
    this.silent = silent;
  }
} 