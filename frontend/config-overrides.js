module.exports = function override(config, env) {
    config.optimization.minimizer[0].options.terserOptions.compress.inline = false;
    return config;
};