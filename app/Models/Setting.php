<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'key',
        'value',
        'type',
        'description',
        'is_public',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'is_public' => 'boolean',
    ];

    /**
     * Get a setting value by key
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public static function getValue(string $key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        
        if (!$setting) {
            return $default;
        }
        
        return static::castValue($setting->value, $setting->type);
    }
    
    /**
     * Alias para getValue - para maior compatibilidade com padrões de outras bibliotecas
     *
     * @param string $key
     * @param mixed $default
     * @return mixed
     */
    public static function get(string $key, $default = null)
    {
        return static::getValue($key, $default);
    }
    
    /**
     * Set a setting value
     *
     * @param string $key
     * @param mixed $value
     * @param string|null $type
     * @param string|null $description
     * @param bool $isPublic
     * @return static
     */
    public static function setValue(string $key, $value, ?string $type = null, ?string $description = null, bool $isPublic = false)
    {
        $setting = static::where('key', $key)->first();
        
        if (!$setting) {
            return static::create([
                'key' => $key,
                'value' => $value,
                'type' => $type ?? 'string',
                'description' => $description,
                'is_public' => $isPublic,
            ]);
        }
        
        $setting->update([
            'value' => $value,
            'type' => $type ?? $setting->type,
            'description' => $description ?? $setting->description,
            'is_public' => $isPublic,
        ]);
        
        return $setting;
    }
    
    /**
     * Cast value based on type
     *
     * @param string|null $value
     * @param string $type
     * @return mixed
     */
    protected static function castValue(?string $value, string $type)
    {
        if ($value === null) {
            return null;
        }
        
        switch ($type) {
            case 'boolean':
                return (bool) $value;
            case 'integer':
                return (int) $value;
            case 'float':
                return (float) $value;
            case 'json':
                return json_decode($value, true);
            case 'array':
                return explode(',', $value);
            default:
                return $value;
        }
    }
} 