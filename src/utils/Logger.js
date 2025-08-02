export class Logger {
  constructor(options = {}) {
    this.verbose = options.verbose || false;
    this.silent = options.silent || false;
  }

  info(message) {
    if (!this.silent) {
      console.log(`ℹ️  ${message}`);
    }
  }

  success(message) {
    if (!this.silent) {
      console.log(`✅ ${message}`);
    }
  }

  warning(message) {
    if (!this.silent) {
      console.log(`⚠️  ${message}`);
    }
  }

  error(message) {
    if (!this.silent) {
      console.error(`❌ ${message}`);
    }
  }

  debug(message) {
    if (this.verbose && !this.silent) {
      console.log(`🐛 ${message}`);
    }
  }

  section(title) {
    if (!this.silent) {
      console.log(`\n${'='.repeat(50)}`);
      console.log(`📋 ${title}`);
      console.log(`${'='.repeat(50)}\n`);
    }
  }

  postPreview(content) {
    if (!this.silent) {
      console.log('\n📣 Post LinkedIn généré :\n');
      console.log(content);
      console.log('\n' + '='.repeat(50) + '\n');
    }
  }

  stats(stats) {
    if (!this.silent) {
      console.log('\n📊 Stats :');
      console.log(`- Tokens utilisés : ${stats.totalTokens}`);
      console.log(`- Modèle utilisé : ${stats.model}`);
      console.log(`- Coût estimé : ~$${stats.estimatedCost.toFixed(4)} USD`);
    }
  }

  progress(step, total, message) {
    if (!this.silent) {
      console.log(`[${step}/${total}] ${message}`);
    }
  }

  setVerbose(verbose) {
    this.verbose = verbose;
  }

  setSilent(silent) {
    this.silent = silent;
  }
} 